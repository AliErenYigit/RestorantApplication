export interface CreateProductRequest {
  categoryId: number;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  sortOrder: number;
  isActive: boolean;
}