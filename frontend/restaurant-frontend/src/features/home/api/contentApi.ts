import { httpClient } from "./httpClient";
import type { SiteContent } from "../types/homeTypes";

export async function getContentByKey(key: string): Promise<SiteContent | null> {
  const response = await httpClient.get<SiteContent>(`/api/public/content/${key}`);
  return response.data;
}