import { httpClient } from "./httpClient";
import type { CommentItem, CreateCommentRequest } from "../types/homeTypes";

export async function getComments(): Promise<CommentItem[]> {
  const response = await httpClient.get<CommentItem[]>("/api/comments");
  return response.data ?? [];
}

export async function createComment(payload: CreateCommentRequest): Promise<string> {
  const response = await httpClient.post<{ message?: string }>("/api/comments", payload);
  return response.data?.message ?? "Yorumunuz alınmıştır.";
}