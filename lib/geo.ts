export type NearbyPlaceType = "mosque" | "ablution";

export type NearbyPlace = {
  id: string;
  name: string;
  type: NearbyPlaceType;
  lat: number;
  lon: number;
  distanceMeters: number;
  address: string | null;
  sourceUrl: string;
};

export type OverpassElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat?: number; lon?: number };
  tags?: Record<string, string>;
};

const EARTH_RADIUS_METERS = 6_371_000;

function toRadians(value: number) {
  return value * Math.PI / 180;
}

export function distanceInMeters(fromLat: number, fromLon: number, toLat: number, toLon: number) {
  const latitudeDelta = toRadians(toLat - fromLat);
  const longitudeDelta = toRadians(toLon - fromLon);
  const fromLatitude = toRadians(fromLat);
  const toLatitude = toRadians(toLat);
  const haversine = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(longitudeDelta / 2) ** 2;
  return Math.round(EARTH_RADIUS_METERS * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine)));
}

function addressFromTags(tags: Record<string, string>) {
  const street = [tags["addr:street"], tags["addr:housenumber"]].filter(Boolean).join(" ");
  return [street, tags["addr:district"], tags["addr:city"]].filter(Boolean).join(", ") || null;
}

export function normalizeOverpassPlaces(elements: OverpassElement[], originLat: number, originLon: number): NearbyPlace[] {
  return elements.flatMap((element) => {
    const lat = element.lat ?? element.center?.lat;
    const lon = element.lon ?? element.center?.lon;
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return [];

    const tags = element.tags ?? {};
    const type: NearbyPlaceType = tags.amenity === "place_of_worship" ? "mosque" : "ablution";
    const name = tags.name || tags["name:uz"] || tags["name:en"]
      || (type === "mosque" ? "Nomsiz masjid" : "Tahoratxona");

    return [{
      id: `${element.type}-${element.id}`,
      name,
      type,
      lat: lat as number,
      lon: lon as number,
      distanceMeters: distanceInMeters(originLat, originLon, lat as number, lon as number),
      address: addressFromTags(tags),
      sourceUrl: `https://www.openstreetmap.org/${element.type}/${element.id}`,
    }];
  }).sort((first, second) => first.distanceMeters - second.distanceMeters);
}
