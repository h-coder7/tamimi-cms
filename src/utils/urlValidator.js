export function isValidUrlOrPath(val) {
  if (!val || typeof val !== "string") return false;
  const trimmed = val.trim();
  if (trimmed.length === 0) return false;
  if (/\s/.test(trimmed)) return false;
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("#") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("tel:")
  ) {
    return true;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
