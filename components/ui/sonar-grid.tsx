"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SonarGridProps extends React.ComponentProps<"div"> {
  spacing?: number;
  dotRadius?: number;
  baseOpacity?: number;
  color?: string;
  pingEvery?: number;
  speed?: number;
  ringWidth?: number;
  amplitude?: number;
  interactive?: boolean;
  maxRings?: number;
  seedPing?: boolean;
  pingArea?: [number, number, number, number];
  interactionTarget?: "host" | "window";
}

interface Ring {
  x: number;
  y: number;
  born: number;
}

const MAX_DPR = 2;
const TAU = Math.PI * 2;

export function SonarGrid({
  spacing = 26,
  dotRadius = 1.4,
  baseOpacity = 0.28,
  color,
  pingEvery = 2.4,
  speed = 260,
  ringWidth = 90,
  amplitude = 2.2,
  interactive = true,
  maxRings = 6,
  seedPing = true,
  pingArea = [0.15, 0.2, 0.85, 0.8],
  interactionTarget = "host",
  className,
  children,
  ref,
  ...rest
}: SonarGridProps) {
  const hostRef = React.useRef<HTMLDivElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const ringsRef = React.useRef<Ring[]>([]);
  const refreshRef = React.useRef<() => void>(() => undefined);
  const opts = React.useRef({ spacing, dotRadius, baseOpacity, pingEvery, speed, ringWidth, amplitude, interactive, maxRings, seedPing, pingArea });

  React.useEffect(() => {
    opts.current = { spacing, dotRadius, baseOpacity, pingEvery, speed, ringWidth, amplitude, interactive, maxRings, seedPing, pingArea };
    refreshRef.current();
  }, [spacing, dotRadius, baseOpacity, pingEvery, speed, ringWidth, amplitude, interactive, maxRings, seedPing, pingArea]);

  const setHost = React.useCallback((node: HTMLDivElement | null) => {
    hostRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  }, [ref]);

  React.useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let frame = 0;
    let timer = 0;
    let visible = true;
    let seeded = false;
    let stroke = "";
    let nextPing = performance.now() + opts.current.pingEvery * 1_000;

    const readColor = () => {
      stroke = getComputedStyle(canvas).color;
    };

    const addRing = (x: number, y: number, born: number) => {
      readColor();
      ringsRef.current.push({ x, y, born });
      while (ringsRef.current.length > opts.current.maxRings) ringsRef.current.shift();
    };

    const draw = (now: number) => {
      const current = opts.current;
      const lifetime = (Math.hypot(width, height) + current.ringWidth) / current.speed;
      ringsRef.current = ringsRef.current.filter((ring) => (now - ring.born) / 1_000 < lifetime);
      const liveRings = ringsRef.current.map((ring) => {
        const age = (now - ring.born) / 1_000;
        const radius = age * current.speed;
        return { x: ring.x, y: ring.y, radius, reach: radius + current.ringWidth, fade: 1 - age / lifetime };
      });

      context.clearRect(0, 0, width, height);
      context.fillStyle = stroke;
      const columns = Math.ceil(width / current.spacing) + 1;
      const rows = Math.ceil(height / current.spacing) + 1;
      const offsetX = (width - (columns - 1) * current.spacing) / 2;
      const offsetY = (height - (rows - 1) * current.spacing) / 2;
      const energized: number[] = [];

      context.globalAlpha = current.baseOpacity;
      context.beginPath();
      for (let column = 0; column < columns; column += 1) {
        const x = offsetX + column * current.spacing;
        for (let row = 0; row < rows; row += 1) {
          const y = offsetY + row * current.spacing;
          let energy = 0;
          for (const ring of liveRings) {
            if (Math.abs(x - ring.x) > ring.reach || Math.abs(y - ring.y) > ring.reach) continue;
            const distance = Math.abs(Math.hypot(x - ring.x, y - ring.y) - ring.radius);
            if (distance >= current.ringWidth) continue;
            const wave = 1 - distance / current.ringWidth;
            const strength = wave * wave * (3 - 2 * wave) * ring.fade;
            if (strength > energy) energy = strength;
          }
          if (energy < 0.01) {
            context.moveTo(x + current.dotRadius, y);
            context.arc(x, y, current.dotRadius, 0, TAU);
          } else {
            energized.push(x, y, energy);
          }
        }
      }
      context.fill();

      for (let index = 0; index < energized.length; index += 3) {
        const energy = energized[index + 2] ?? 0;
        context.globalAlpha = current.baseOpacity + (1 - current.baseOpacity) * energy;
        context.beginPath();
        context.arc(energized[index] ?? 0, energized[index + 1] ?? 0, current.dotRadius * (1 + current.amplitude * energy), 0, TAU);
        context.fill();
      }
      context.globalAlpha = 1;
    };

    const resize = () => {
      const rect = host.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      const density = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.round(width * density);
      canvas.height = Math.round(height * density);
      context.setTransform(density, 0, 0, density, 0, 0);
      if (!seeded) {
        seeded = true;
        const [x0, y0, x1, y1] = opts.current.pingArea;
        if (opts.current.seedPing && !reduceMotion.matches) {
          addRing(width * (x0 + (x1 - x0) * 0.68), height * (y0 + (y1 - y0) * 0.34), performance.now() - 500);
        }
      }
      draw(performance.now());
    };

    const scheduleIdle = (delay: number) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => tick(performance.now()), Math.max(16, delay));
    };

    const tick = (now: number) => {
      frame = 0;
      if (!visible || document.hidden) return;
      if (reduceMotion.matches) {
        ringsRef.current = [];
        draw(now);
        return;
      }
      const current = opts.current;
      if (current.pingEvery > 0 && now >= nextPing) {
        const [x0, y0, x1, y1] = current.pingArea;
        addRing(width * (x0 + Math.random() * (x1 - x0)), height * (y0 + Math.random() * (y1 - y0)), now);
        nextPing = now + current.pingEvery * 1_000;
      }
      draw(now);
      if (ringsRef.current.length > 0) frame = requestAnimationFrame(tick);
      else if (current.pingEvery > 0) scheduleIdle(nextPing - now);
    };

    const wake = () => {
      if (!frame) {
        window.clearTimeout(timer);
        frame = requestAnimationFrame(tick);
      }
    };

    refreshRef.current = () => {
      readColor();
      nextPing = Math.min(nextPing, performance.now() + opts.current.pingEvery * 1_000);
      wake();
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!opts.current.interactive || reduceMotion.matches) return;
      const rect = host.getBoundingClientRect();
      addRing(event.clientX - rect.left, event.clientY - rect.top, performance.now());
      wake();
    };
    const onVisibility = () => {
      if (!document.hidden) wake();
    };

    const resizeObserver = new ResizeObserver(resize);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      if (visible) wake();
    }, { threshold: 0 });
    const mutationObserver = new MutationObserver(() => refreshRef.current());
    const pointerTarget: HTMLElement | Window = interactionTarget === "window" ? window : host;

    readColor();
    resize();
    resizeObserver.observe(host);
    intersectionObserver.observe(host);
    mutationObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme"] });
    pointerTarget.addEventListener("pointerdown", onPointerDown as EventListener);
    document.addEventListener("visibilitychange", onVisibility);
    reduceMotion.addEventListener("change", wake);
    wake();

    return () => {
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      mutationObserver.disconnect();
      pointerTarget.removeEventListener("pointerdown", onPointerDown as EventListener);
      document.removeEventListener("visibilitychange", onVisibility);
      reduceMotion.removeEventListener("change", wake);
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      refreshRef.current = () => undefined;
    };
  }, [interactionTarget]);

  return <div ref={setHost} data-slot="sonar-grid" className={cn(className)} {...rest}>
    <canvas ref={canvasRef} aria-hidden="true" className="sonar-grid-canvas" style={color ? { color } : undefined} />
    {children}
  </div>;
}

export default SonarGrid;
