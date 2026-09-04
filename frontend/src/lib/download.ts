"use client"

/**
 * Trigger a download from JavaScript by navigating to a same-origin endpoint
 * that streams the file with `Content-Disposition: attachment`.
 *
 * Files themselves live on Cloudinary (cross-origin), where a browser will
 * preview a document but silently ignore a forced download. The backend proxies
 * the bytes through a same-origin ``download-file`` endpoint so the attachment
 * header is honoured without any cross-origin fetch.
 *
 * We don't fetch here — the response is streamed by the browser directly, which
 * is exactly why it avoids the CORS failures a blob-based fetch would hit.
 */
export function downloadFile(url: string): void {
  // An invisible anchor keeps this navigable from within handlers without a
  // "beforeunload" trick; the server decides the filename via Content-Disposition.
  const anchor = document.createElement("a")
  anchor.href = url
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
}