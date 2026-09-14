import { normalizeOverpassPlaces, type OverpassElement } from "../../../../lib/geo";

const OVERPASS_ENDPOINT = "https://overpass-api.de/api/interpreter";

function numericParameter(value: string | null, minimum: number, maximum: number) {
  if (value === null || value.trim() === "") return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= minimum && number <= maximum ? number : null;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const lat = numericParameter(url.searchParams.get("lat"), -90, 90);
  const lon = numericParameter(url.searchParams.get("lon"), -180, 180);
  const requestedRadius = numericParameter(url.searchParams.get("radius"), 1_000, 10_000);
  if (lat === null || lon === null) {
    return Response.json({ error: "To‘g‘ri lat va lon qiymatlari kerak" }, { status: 400 });
  }

  const radius = Math.round(requestedRadius ?? 5_000);
  const query = `[out:json][timeout:20];
(
  nwr(around:${radius},${lat},${lon})["amenity"="place_of_worship"]["religion"="muslim"];
  nwr(around:${radius},${lat},${lon})["amenity"="ablution"];
);
out center tags;`;

  try {
    const response = await fetch(OVERPASS_ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
        "user-agent": "Duodosh/1.0 (https://duodosh.pokoandmii.chatgpt.site)",
      },
      body: new URLSearchParams({ data: query }),
    });
    if (!response.ok) throw new Error(`OpenStreetMap xizmati ${response.status} javobini berdi`);

    const payload = await response.json() as { elements?: OverpassElement[] };
    const places = normalizeOverpassPlaces(payload.elements ?? [], lat, lon).slice(0, 50);
    return Response.json({ places, center: { lat, lon }, radius }, {
      headers: { "cache-control": "private, max-age=300" },
    });
  } catch (error) {
    return Response.json({
      error: error instanceof Error ? error.message : "Yaqin joylarni olish imkoni bo‘lmadi",
    }, { status: 503 });
  }
}
