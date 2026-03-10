import { api } from "@/shared/api/axios";
import { endpoints } from "@/shared/api/endpoints";
import type { Category } from "../types/category";

export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get<Category[]>(endpoints.public.categories);
  return response.data;
};