import axios from "axios";

const API_BASE_URL = "http://localhost:5041";

export type AdminProductDto = {
  id: number;
  categoryId: number;
  name: string;
  price: number;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder?: number | null;
  isActive?: boolean;
};

export async function getAdminProducts(adminKey: string): Promise<AdminProductDto[]> {
  const response = await axios.get<AdminProductDto[]>(
    `${API_BASE_URL}/api/admin/products`,
    {
      headers: {
        "X-Admin-Key": adminKey,
      },
    }
  );

  return response.data ?? [];
}