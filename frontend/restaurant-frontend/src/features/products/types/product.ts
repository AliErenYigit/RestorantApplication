export interface Product {
  id: number;
  categoryId: number;
  name: string;
  price: number;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  isActive: boolean;
}