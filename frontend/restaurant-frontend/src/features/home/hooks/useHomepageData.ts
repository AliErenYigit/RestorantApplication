import { useEffect, useMemo, useState } from "react";
import { getComments } from "../api/commentApi";
import { getContentByKey } from "../api/contentApi";
import { getTeamMembers } from "../api/teamApi";
import type { CommentItem, SiteContent, TeamMember } from "../types/homeTypes";
import { API_BASE_URL } from "../api/httpClient";

export function useHomepageData() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        setHasError(false);

        const [contentData, teamData, commentsData] = await Promise.all([
          getContentByKey("homepage"),
          getTeamMembers(),
          getComments(),
        ]);

        if (cancelled) return;

        setContent(contentData);
        setTeamMembers(teamData);
        setComments(commentsData);
      } catch (error) {
        console.error("Homepage fetch failed:", error);
        if (!cancelled) {
          setHasError(true);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const title = useMemo(() => {
    return content?.title?.trim() || "Restoran Menüsüne Hoş Geldiniz";
  }, [content]);

  const body = useMemo(() => {
    return (
      content?.body?.trim() ||
      "Kategorilere göre ürünleri inceleyin, fiyatları görün ve mobil uyumlu menü deneyimini kullanın."
    );
  }, [content]);

  const heroImageUrl = useMemo(() => {
    if (!content?.imageUrl) return null;
    if (content.imageUrl.startsWith("http")) return content.imageUrl;
    return `${API_BASE_URL}${content.imageUrl}`;
  }, [content]);

  function resolveImageUrl(imageUrl?: string | null) {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("http")) return imageUrl;
    return `${API_BASE_URL}${imageUrl}`;
  }

  return {
    content,
    teamMembers,
    comments,
    isLoading,
    hasError,
    title,
    body,
    heroImageUrl,
    resolveImageUrl,
  };
}