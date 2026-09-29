import { api } from "../lib/api.js";

/**
 * Create a new review.
 * @param {{ osmId: number, placeName?: string, rating: number, comment?: string, anonymous?: boolean }} data
 */
export function createReview({ osmId, placeName, rating, comment, anonymous }) {
  return api.post("/api/v1/reviews", { osmId, placeName, rating, comment, anonymous });
}

/** Get all reviews for a specific place (by osmId). */
export function getReviewsByOsmId(osmId) {
  return api.get(`/api/v1/reviews/place/${osmId}`);
}

/**
 * Get summary (average rating + total count) for a place.
 * @returns {Promise<{data: { osmId: number, averageRating: number, totalReviews: number }}>}
 */
export function getReviewSummary(osmId) {
  return api.get(`/api/v1/reviews/place/${osmId}/summary`);
}

/** Get reviews written by the current authenticated user. */
export function getMyReviews() {
  return api.get("/api/v1/reviews/me");
}

/** Get a single review by ID. */
export function getReviewById(reviewId) {
  return api.get(`/api/v1/reviews/${reviewId}`);
}

/**
 * Update a review.
 * @param {number} reviewId
 * @param {{ rating: number, comment?: string, anonymous?: boolean }} data
 */
export function updateReview(reviewId, { rating, comment, anonymous }) {
  return api.put(`/api/v1/reviews/${reviewId}`, { rating, comment, anonymous });
}

/** Delete a review by ID. */
export function deleteReview(reviewId) {
  return api.delete(`/api/v1/reviews/${reviewId}`);
}

/**
 * Get / search all reviews for admin moderation or filtering.
 * @param {{ osmId?: number, minRating?: number }} [params]
 */
export function getAllReviews(params = {}) {
  return api.get("/api/v1/reviews/search", { params });
}

