/**
 * Blends the hero's Nightfield scrim into the page background so the sections
 * read as one continuous surface. In dark mode (background = Nightfield) this
 * is nearly invisible by design; in light mode it fades the dark hero out.
 */
export function HeroTransition() {
  return (
    <div
      aria-hidden="true"
      className="h-20 bg-gradient-to-b from-[#0b120c] to-background md:h-28"
    />
  )
}
