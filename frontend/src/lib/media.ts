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
 * Brand-styled default avatar (ivory background, maroon silhouette, gold ring)
 * shown wherever a profile has no uploaded photo. Encoded as an inline SVG data
 * URI so it never depends on an external image service or network call.
 */
const buildDefaultAvatar = (gender?: string | null) => {
  // Subtle tonal variation so male / female / unspecified profiles feel
  // distinct without resorting to literal gendered iconography.
  const accent =
    gender === "female" ? "#7B1E3D" : gender === "male" ? "#274B4B" : "#7B1E3D";

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="#FBF9F6" />
      <circle cx="100" cy="100" r="94" fill="none" stroke="#C89A45" stroke-width="2.5" opacity="0.6" />
      <circle cx="100" cy="82" r="34" fill="${accent}" opacity="0.85" />
      <path d="M30 190 C30 138 60 112 100 112 C140 112 170 138 170 190 Z" fill="${accent}" opacity="0.85" />
    </svg>`.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const DEFAULT_AVATAR = buildDefaultAvatar();

/**
 * Returns an absolute photo URL for profile visualization cards: uses the real upload path
 * if present, otherwise falls back to a tasteful default avatar so no image slot is ever
 * left compulsory or broken.
 */
export const getDisplayPhoto = (
  url?: string | null,
  gender?: string | null,
) => {
  const real = resolvePhotoUrl(url);
  if (real) return real;

  return buildDefaultAvatar(gender);
};