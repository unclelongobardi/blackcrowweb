const MAX_WEBP_DATA_URL_CHARS = 500_000;

/** Only allow images uploaded through our Sharp pipeline (base64 webp data URLs). */
export function isAllowedPostImageUrl(url: string | null | undefined): boolean {
  if (!url) return true;
  if (!url.startsWith("data:image/webp;base64,")) return false;
  return url.length <= MAX_WEBP_DATA_URL_CHARS;
}
