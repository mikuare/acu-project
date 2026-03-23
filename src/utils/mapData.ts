type CoordinateLike = {
  latitude: unknown;
  longitude: unknown;
};

type LineStringGeometry = {
  type: "LineString";
  coordinates: [number, number][];
};

type RouteFeature = {
  type: "Feature";
  properties: Record<string, never>;
  geometry: LineStringGeometry;
};

export const isFiniteCoordinate = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

export const hasValidCoordinates = (
  value: CoordinateLike | null | undefined,
): value is { latitude: number; longitude: number } =>
  !!value &&
  isFiniteCoordinate(value.latitude) &&
  isFiniteCoordinate(value.longitude);

const isValidLineStringGeometry = (value: unknown): value is LineStringGeometry => {
  if (!value || typeof value !== "object" || (value as { type?: unknown }).type !== "LineString") {
    return false;
  }

  const coordinates = (value as { coordinates?: unknown }).coordinates;
  return (
    Array.isArray(coordinates) &&
    coordinates.length > 0 &&
    coordinates.every(
      (coordinate) =>
        Array.isArray(coordinate) &&
        coordinate.length >= 2 &&
        isFiniteCoordinate(coordinate[0]) &&
        isFiniteCoordinate(coordinate[1]),
    )
  );
};

export const normalizeRouteFeature = (value: unknown): RouteFeature | null => {
  if (isValidLineStringGeometry(value)) {
    return {
      type: "Feature",
      properties: {},
      geometry: value,
    };
  }

  if (
    value &&
    typeof value === "object" &&
    (value as { type?: unknown }).type === "Feature" &&
    isValidLineStringGeometry((value as { geometry?: unknown }).geometry)
  ) {
    return {
      type: "Feature",
      properties: {},
      geometry: (value as { geometry: LineStringGeometry }).geometry,
    };
  }

  return null;
};

export const distanceBetweenMeters = (
  start: { latitude: number; longitude: number },
  end: { latitude: number; longitude: number },
): number => {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const earthRadius = 6371000;

  const latDelta = toRadians(end.latitude - start.latitude);
  const lngDelta = toRadians(end.longitude - start.longitude);
  const startLat = toRadians(start.latitude);
  const endLat = toRadians(end.latitude);

  const a =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.cos(startLat) *
      Math.cos(endLat) *
      Math.sin(lngDelta / 2) *
      Math.sin(lngDelta / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
};

export const getRouteBounds = (
  value: unknown,
): [[number, number], [number, number]] | null => {
  const route = normalizeRouteFeature(value);
  if (!route) {
    return null;
  }

  const [firstLng, firstLat] = route.geometry.coordinates[0];
  let minLng = firstLng;
  let maxLng = firstLng;
  let minLat = firstLat;
  let maxLat = firstLat;

  route.geometry.coordinates.forEach(([lng, lat]) => {
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  });

  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
};
