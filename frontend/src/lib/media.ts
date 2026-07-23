/**
 * Cloudflare R2 video assets. Referenced directly in <video> sources — never
 * proxied through the DRF API (Vercel caps serverless bodies at 4.5MB).
 * Local posters live in /public and are used for reduced-motion / Save-Data.
 */
const R2 = "https://pub-ae60aabd58e04ea3b36fa57df124c761.r2.dev/compressed"

export const VIDEOS = {
  goatsSahel: `${R2}/goats_sahel.mp4`, // 1.3MB — homepage hero, preload eagerly
  feedingCattle: `${R2}/feeding_cattle.mp4`, // 16MB — /learn field, lazy
  littleChicks: `${R2}/little_chicks.mp4`, // 5.7MB — farm store, lazy
  fishesInPond: `${R2}/fishes_in_pond_30s.mp4`, // 4MB 30s loop — tilapia field-break, lazy
} as const

// Local atmospheric assets (served from /public, not R2).
export const LOCAL_VIDEOS = {
  grazingLoop: "/atmospheric/4k-cinematic-loop-livestock-grazing.mp4", // 6.2MB — prior hero clip
} as const

// Local poster frames (existing atmospheric asset until dedicated frames land).
export const POSTERS = {
  hero: "/atmospheric/high-res-wide-shot-with-negative-text.png",
} as const
