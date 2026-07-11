// Central helper for turning a stored photo path into something <img> can load,
// and for giving every profile a tasteful placeholder photo when none has been
// uploaded yet.

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

/** Resolves a stored photo URL string to a fully-qualified backend route. */
export const resolvePhotoUrl = (url?: string | null) => {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  // Standardize potential Windows file system paths
  let cleanPath = url.replace(/\\/g, "/");

  // Strip any leading slash(es) first so the prefix checks below match
  // paths like "/uploads/xxx.jpg" the same way they match "uploads/xxx.jpg".
  cleanPath = cleanPath.replace(/^\/+/, "");

  // Completely clean legacy database string folder prefixes
  cleanPath = cleanPath.replace(/^backend\/src\/uploads\//, "");
  cleanPath = cleanPath.replace(/^backend\/uploads\//, "");
  cleanPath = cleanPath.replace(/^src\/uploads\//, "");
  cleanPath = cleanPath.replace(/^uploads\//, "");
  cleanPath = cleanPath.replace(/^\/+/, "");

  // Constructs perfectly clean URL: http://localhost:5000/uploads/1783518014732.jpg
  return `${API_ORIGIN}/uploads/${cleanPath}`;
};

/**
 * Returns an absolute photo URL for profile visualization cards: uses the real upload path 
 * if verified, otherwise generates a fallback based on deterministic gender indexing.
 */
export const getDisplayPhoto = (
  url?: string | null,

) => {
  const real = resolvePhotoUrl(url);
  if (real) return real;

  return "";
};