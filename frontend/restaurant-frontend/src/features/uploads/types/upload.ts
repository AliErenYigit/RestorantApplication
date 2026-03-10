export interface UploadImageResponse {
  imageUrl: string;
  sha256: string;
  duplicated: boolean;
}

export interface UploadLogItem {
  id: number;
  fileName: string;
  relativePath: string;
  contentType: string;
  sizeBytes: number;
  sha256: string;
  scanStatus: string;
  scanEngine: string;
  uploadedAt: string;
}

export interface PagedResult<T> {
  page: number;
  pageSize: number;
  total: number;
  items: T[];
}