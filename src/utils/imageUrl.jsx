const API_BASE_URL = "https://602.nxtai.dev";

/**
 * Prefixes a relative image path returned by the API with the base URL.
 * Leaves already-absolute URLs (http/https) and blob: preview URLs untouched.
 * Returns "" for empty/undefined paths so callers can fall back to a default image.
 */
export const getFullImageUrl = (path) => {
  if (!path) return "";
  if (/^(https?:|blob:|data:)/i.test(path)) return path;
  return `${API_BASE_URL}/${path.replace(/^\/+/, "")}`;
};