import { api } from "~/shared/lib/api";

// Known coordinates mapping for popular destinations
export const DESTINATION_COORDINATES = {
  "huế": { lat: 16.4637, lng: 107.5909 },
  "hue": { lat: 16.4637, lng: 107.5909 },
  "đà nẵng": { lat: 16.0544, lng: 108.2022 },
  "da nang": { lat: 16.0544, lng: 108.2022 },
  "hội an": { lat: 15.8801, lng: 108.338 },
  "hanoi": { lat: 21.0285, lng: 105.8542 },
  "hà nội": { lat: 21.0285, lng: 105.8542 },
  "hồ chí minh": { lat: 10.7769, lng: 106.7009 },
  "tp. hồ chí minh": { lat: 10.7769, lng: 106.7009 },
  "ho chi minh": { lat: 10.7769, lng: 106.7009 },
  "sài gòn": { lat: 10.7769, lng: 106.7009 },
  "đà lạt": { lat: 11.9404, lng: 108.4583 },
  "nha trang": { lat: 12.2388, lng: 109.1967 },
  "barcelona": { lat: 41.3879, lng: 2.1699 },
  "barcelona, spain": { lat: 41.3879, lng: 2.1699 }
};

export function resolveCoordinates(destinationName) {
  if (!destinationName) return DESTINATION_COORDINATES["huế"];
  const normalized = destinationName.trim().toLowerCase();
  for (const [key, coords] of Object.entries(DESTINATION_COORDINATES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return coords;
    }
  }
  return DESTINATION_COORDINATES["huế"];
}

/**
 * Fetch nearby places from Spring Boot backend LocationController:
 * POST /api/v1/locations/nearby
 * Real backend call - NO mock data!
 */
export async function searchNearbyPlaces(filterPayload) {
  try {
    const response = await api.post("/api/v1/locations/nearby", filterPayload);
    if (response && response.data) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error("Backend /api/v1/locations/nearby query failed:", error);
    return [];
  }
}
