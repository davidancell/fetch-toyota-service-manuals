/**
 * Sanitizes a filename by replacing invalid characters with safe alternatives.
 * Windows doesn't allow: < > : " / \ | ? *
 * This function also handles reserved names and ensures the filename isn't empty.
 * @param filename - The filename to sanitize
 * @returns A sanitized filename safe for use on all platforms
 */
export default function sanitizeFilename(filename: string): string {
  // Replace invalid characters with a hyphen
  let sanitized = filename
    .replace(/[<>:"/\\|?*]/g, "-")
    // Remove any control characters (ASCII 0-31)
    .replace(/[\x00-\x1f]/g, "")
    // Replace multiple consecutive hyphens with a single hyphen
    .replace(/-+/g, "-")
    // Remove leading/trailing hyphens and spaces
    .trim()
    .replace(/^-+|-+$/g, "");

  // Windows reserved names (case-insensitive)
  const reservedNames = [
    "CON",
    "PRN",
    "AUX",
    "NUL",
    "COM1",
    "COM2",
    "COM3",
    "COM4",
    "COM5",
    "COM6",
    "COM7",
    "COM8",
    "COM9",
    "LPT1",
    "LPT2",
    "LPT3",
    "LPT4",
    "LPT5",
    "LPT6",
    "LPT7",
    "LPT8",
    "LPT9",
  ];

  // Check if the filename (without extension) is a reserved name
  const nameWithoutExt = sanitized.split(".")[0].toUpperCase();
  if (reservedNames.includes(nameWithoutExt)) {
    sanitized = `_${sanitized}`;
  }

  // If the sanitized filename is empty, use a default
  if (!sanitized) {
    sanitized = "unnamed";
  }

  return sanitized;
}
