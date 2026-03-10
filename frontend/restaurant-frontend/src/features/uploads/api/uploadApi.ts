
import { createAdminApi } from "@/shared/api/axios";
import { endpoints } from "@/shared/api/endpoints";
import type {
  PagedResult,
  UploadImageResponse,
  UploadLogItem,
} from "../types/upload";

export const uploadProductImage = async (
  adminKey: string,
  file: File
): Promise<UploadImageResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const adminApi = createAdminApi(adminKey);

  const response = await adminApi.post<UploadImageResponse>(
    endpoints.admin.uploadProductImage,
    formData,
    {
      transformRequest: [(data) => data],
      headers: {
        Accept: "application/json",
      },
    }
  );

  return response.data;
};

export const deleteProductImage = async (
  adminKey: string,
  imageUrl: string
): Promise<void> => {
  const adminApi = createAdminApi(adminKey);

  await adminApi.delete(endpoints.admin.deleteProductImage, {
    params: { imageUrl },
  });
};

export interface GetUploadLogsParams {
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export const getUploadLogs = async (
  adminKey: string,
  params?: GetUploadLogsParams
): Promise<PagedResult<UploadLogItem>> => {
  const adminApi = createAdminApi(adminKey);

  const response = await adminApi.get<PagedResult<UploadLogItem>>(
    endpoints.admin.uploads,
    {
      params,
    }
  );

  return response.data;
};