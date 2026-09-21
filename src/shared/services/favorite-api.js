import { api } from "../lib/api.js";

/**
 * Add a place to the current user's favorites.
 * @param {{ osmId: number, placeName?: string, latitude?: number, longitude?: number }} data
 */
export function addFavorite({ osmId, placeName, latitude, longitude }) {
  return api.post("/api/v1/favorites", { osmId, placeName, latitude, longitude });
}

/** Get all favorites of the current authenticated user. */
export function getMyFavorites() {
  return api.get("/api/v1/favorites/me");
}

/**
 * Check whether a place (by osmId) is already favorited.
 * @returns {Promise<{data: boolean}>}
 */
export function checkFavorite(osmId) {
  return api.get(`/api/v1/favorites/check/${osmId}`);
}

/** Remove a favorite by its OSM ID. */
export function removeFavoriteByOsmId(osmId) {
  return api.delete(`/api/v1/favorites/osm/${osmId}`);
}

/** Remove a favorite by its favorite record ID. */
export function removeFavoriteById(favoriteId) {
  return api.delete(`/api/v1/favorites/${favoriteId}`);
}

/** Search favorites by keyword. */
export function searchFavorites(keyword) {
  return api.get(`/api/v1/favorites/search?keyword=${encodeURIComponent(keyword)}`);
}
