import { api } from "../lib/api.js";

/**
 * Fetch all users (Admin only)
 */
export async function getAllUsersApi() {
  return await api.get("/api/admin/users");
}

/**
 * Get user details by ID
 */
export async function getUserByIdApi(userId) {
  return await api.get(`/api/admin/users/${userId}`);
}

/**
 * Create a new user (Admin)
 */
export async function createUserApi(data) {
  return await api.post("/api/admin/users", data);
}

/**
 * Update user details or status / role (Admin)
 */
export async function updateUserApi(userId, data) {
  return await api.put(`/api/admin/users/${userId}`, data);
}

/**
 * Delete a user (Admin)
 */
export async function deleteUserApi(userId) {
  return await api.delete(`/api/admin/users/${userId}`);
}

