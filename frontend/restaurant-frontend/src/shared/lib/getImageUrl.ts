export function getImageUrl(imageUrl?: string | null): string {
  if (!imageUrl) return "";

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  const baseUrl = import.meta.env.VITE_BACKEND_ORIGIN;

  if (!baseUrl) {
    return imageUrl;
  }

  return `${baseUrl}${imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`}`;
}