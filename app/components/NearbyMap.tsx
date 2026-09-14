"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LayerGroup, Map as LeafletMap } from "leaflet";
import type { NearbyPlace, NearbyPlaceType } from "../../lib/geo";

const TASHKENT_CENTER = { lat: 41.3111, lon: 69.2797 };

function formatDistance(meters: number) {
  if (meters < 1_000) return `${meters} m`;
  return `${(meters / 1_000).toFixed(meters < 10_000 ? 1 : 0)} km`;
}

function directionsUrl(place: NearbyPlace, origin: { lat: number; lon: number }) {
  return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_foot&route=${origin.lat}%2C${origin.lon}%3B${place.lat}%2C${place.lon}`;
}

async function fetchNearby(nextCenter: { lat: number; lon: number }) {
  const params = new URLSearchParams({ lat: String(nextCenter.lat), lon: String(nextCenter.lon), radius: "5000" });
  const response = await fetch(`/api/places/nearby?${params}`, { cache: "no-store" });
  const payload = await response.json() as { places?: NearbyPlace[]; error?: string };
  if (!response.ok) throw new Error(payload.error || "Joylar yuklanmadi");
  return payload.places ?? [];
}

export default function NearbyMap() {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const placesLayerRef = useRef<LayerGroup | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [center, setCenter] = useState(TASHKENT_CENTER);
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [filter, setFilter] = useState<"all" | NearbyPlaceType>("all");
  const [mode, setMode] = useState<"tashkent" | "personal">("tashkent");
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");

  const loadPlaces = useCallback(async (nextCenter: { lat: number; lon: number }, nextMode: "tashkent" | "personal") => {
    setStatus("loading");
    setMessage("");
    try {
      const nearbyPlaces = await fetchNearby(nextCenter);
      setCenter(nextCenter);
      setMode(nextMode);
      setPlaces(nearbyPlaces);
      setStatus("ready");
    } catch {
      setStatus("error");
      setMessage("Xarita joylari hozir yuklanmadi. Birozdan keyin qayta urinib ko‘ring.");
    }
  }, []);

  useEffect(() => {
    let active = true;
    void fetchNearby(TASHKENT_CENTER).then((nearbyPlaces) => {
      if (!active) return;
      setPlaces(nearbyPlaces);
      setStatus("ready");
    }).catch(() => {
      if (!active) return;
      setStatus("error");
      setMessage("Xarita joylari hozir yuklanmadi. Birozdan keyin qayta urinib ko‘ring.");
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    if (!mapElementRef.current) return;
    void import("leaflet").then((leaflet) => {
      if (!active || !mapElementRef.current || mapRef.current) return;
      const map = leaflet.map(mapElementRef.current, { zoomControl: true }).setView([TASHKENT_CENTER.lat, TASHKENT_CENTER.lon], 13);
      leaflet.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
      mapRef.current = map;
      placesLayerRef.current = leaflet.layerGroup().addTo(map);
      setMapReady(true);
    });
    return () => {
      active = false;
      mapRef.current?.remove();
      mapRef.current = null;
      placesLayerRef.current = null;
    };
  }, []);

  const visiblePlaces = useMemo(
    () => filter === "all" ? places : places.filter((place) => place.type === filter),
    [filter, places],
  );

  useEffect(() => {
    if (!mapReady || !mapRef.current || !placesLayerRef.current) return;
    void import("leaflet").then((leaflet) => {
      const map = mapRef.current;
      const layer = placesLayerRef.current;
      if (!map || !layer) return;
      layer.clearLayers();

      const originIcon = leaflet.divIcon({ className: "map-pin-wrap", html: '<span class="map-pin origin"></span>', iconSize: [22, 22], iconAnchor: [11, 11] });
      leaflet.marker([center.lat, center.lon], { icon: originIcon, keyboard: true, title: mode === "personal" ? "Sizning joylashuvingiz" : "Toshkent markazi" }).addTo(layer);

      visiblePlaces.forEach((place) => {
        const markerIcon = leaflet.divIcon({
          className: "map-pin-wrap",
          html: `<span class="map-pin ${place.type}"><i>${place.type === "mosque" ? "☾" : "≈"}</i></span>`,
          iconSize: [30, 36],
          iconAnchor: [15, 34],
        });
        const popup = document.createElement("div");
        const title = document.createElement("strong");
        const meta = document.createElement("span");
        title.textContent = place.name;
        meta.textContent = `${place.type === "mosque" ? "Masjid" : "Tahoratxona"} · ${formatDistance(place.distanceMeters)}`;
        popup.append(title, meta);
        leaflet.marker([place.lat, place.lon], { icon: markerIcon, keyboard: true, title: place.name }).bindPopup(popup).addTo(layer);
      });

      const points: [number, number][] = [[center.lat, center.lon], ...visiblePlaces.slice(0, 12).map((place) => [place.lat, place.lon] as [number, number])];
      if (points.length > 1) map.fitBounds(leaflet.latLngBounds(points), { padding: [34, 34], maxZoom: 15 });
      else map.setView([center.lat, center.lon], 13);
    });
  }, [center, mapReady, mode, visiblePlaces]);

  function useMyLocation() {
    if (!("geolocation" in navigator)) {
      setMessage("Bu qurilma joylashuvni aniqlashni qo‘llamaydi.");
      return;
    }
    setStatus("loading");
    setMessage("");
    navigator.geolocation.getCurrentPosition(
      (position) => void loadPlaces({ lat: position.coords.latitude, lon: position.coords.longitude }, "personal"),
      () => {
        setStatus("ready");
        setMessage("Joylashuvga ruxsat berilmadi. Hozir Toshkent markazi ko‘rsatilmoqda.");
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 300_000 },
    );
  }

  return <section className="nearby-card" aria-labelledby="nearby-map-title">
    <div className="nearby-heading">
      <div><p className="eyebrow">YAQIN JOYLAR</p><h2 id="nearby-map-title">Masjid va tahoratxonalar xaritasi</h2><p>{mode === "personal" ? "Sizdan 5 km masofadagi joylar" : "Hozircha Toshkent markazidan 5 km radius ko‘rsatilmoqda"}</p></div>
      <button className="location-button" onClick={useMyLocation} disabled={status === "loading"}><span>◎</span>{status === "loading" ? "Aniqlanmoqda…" : "Joylashuvimni aniqlash"}</button>
    </div>
    <div className="map-filters" role="group" aria-label="Xarita filtrlari">
      <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>Barchasi <b>{places.length}</b></button>
      <button className={filter === "mosque" ? "active" : ""} onClick={() => setFilter("mosque")}>☾ Masjid <b>{places.filter((place) => place.type === "mosque").length}</b></button>
      <button className={filter === "ablution" ? "active" : ""} onClick={() => setFilter("ablution")}>≈ Tahoratxona <b>{places.filter((place) => place.type === "ablution").length}</b></button>
    </div>
    <div className="nearby-map" ref={mapElementRef} role="application" aria-label="Yaqin masjid va tahoratxonalar xaritasi" />
    {message && <p className="map-message" role="status">{message}</p>}
    <div className="nearby-list">
      {status === "loading" && places.length === 0 && <div className="map-empty">Yaqin joylar qidirilmoqda…</div>}
      {status !== "loading" && visiblePlaces.length === 0 && <div className="map-empty">Bu hududda OpenStreetMap ma’lumotiga kiritilgan joy topilmadi.</div>}
      {visiblePlaces.slice(0, 8).map((place) => <article key={place.id}>
        <span className={`place-icon ${place.type}`}>{place.type === "mosque" ? "☾" : "≈"}</span>
        <div><span>{place.type === "mosque" ? "MASJID" : "TAHORATXONA"}</span><h3>{place.name}</h3><p>{place.address || "Manzil xaritada ko‘rsatilgan"} · <b>{formatDistance(place.distanceMeters)}</b></p></div>
        <a href={directionsUrl(place, center)} target="_blank" rel="noreferrer">Yo‘lni ochish →</a>
      </article>)}
    </div>
    <p className="map-privacy">⌾ Joylashuvingiz Duodosh bazasida saqlanmaydi. Natijalar OpenStreetMap ma’lumotlariga bog‘liq va ayrim tahoratxonalar hali xaritaga kiritilmagan bo‘lishi mumkin.</p>
  </section>;
}
