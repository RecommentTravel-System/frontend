import { api } from "~/shared/lib/api";

export async function getAllCategoriesApi() {
  return await api.get("/api/v1/categories");
}

export async function getCategoryByIdApi(id) {
  return await api.get(`/api/v1/categories/${id}`);
}

export async function createCategoryApi(data) {
  return await api.post("/api/v1/categories", data);
}

export async function updateCategoryApi(id, data) {
  return await api.put(`/api/v1/categories/${id}`, data);
}

export async function deleteCategoryApi(id) {
  return await api.delete(`/api/v1/categories/${id}`);
}

export async function searchCategoriesApi(keyword) {
  const query = keyword ? `?keyword=${encodeURIComponent(keyword)}` : "";
  return await api.get(`/api/v1/categories/search${query}`);
}
