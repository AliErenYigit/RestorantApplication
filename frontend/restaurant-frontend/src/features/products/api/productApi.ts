import { api, createAdminApi } from "@/shared/api/axios";
import { endpoints } from "@/shared/api/endpoints";
import type { Product } from "../types/product";
import type { CreateProductRequest } from "../types/createProductRequest";

export const getProductsByCategorySlug = async (
  slug: string
): Promise<Product[]> => {
  const response = await api.get<Product[]>(
    endpoints.public.productsByCategorySlug(slug)
  );
  return response.data;
};

export const createProduct = async (
  adminKey: string,
  payload: CreateProductRequest
): Promise<void> => {
  const adminApi = createAdminApi(adminKey);
  await adminApi.post(endpoints.admin.products, payload);
};