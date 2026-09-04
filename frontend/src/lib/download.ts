"use client"

/**
 * Trigger a download entirely from JavaScript: fetch the bytes as a blob and
 * click a hidden anchor with a `download` attribute.
 *
 * Doing it this way (rather than a plain `<a href>` or a server
 * `Content-Disposition: attachment` header) means the same resource can be
 * previewed in the browser's PDF viewer *and* downloaded on demand, wherever
 * the file happens to live.
 */
export async function downloadFile(url: string, filename: string): Promise<void> {
  const response = await fetch(url, { credentials: "include" })
  if (!response.ok) {
    throw new Error(`Download failed (${response.status})`)
  }

  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)

  const anchor = document.createElement("a")
  anchor.href = objectUrl
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()

  // Free the object URL once the browser has had a chance to start the download.
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
}

/** Make a downloable filename from a title/name, falling back to a generic name. */
export function toFilename(name: string, fallback = "document"): string {
  const cleaned = (name || "")
    .normalize("NFKD")
    .replace(/[^\w]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return cleaned || fallback
}