import { httpClient } from "./httpClient";
import type { TeamMember } from "../types/homeTypes";

export async function getTeamMembers(): Promise<TeamMember[]> {
  const response = await httpClient.get<TeamMember[]>("/api/team-members");
  return response.data ?? [];
}