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
