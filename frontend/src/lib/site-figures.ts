"use client"

import { useEffect, useState } from "react"
import { siteFiguresApi } from "./api"
import type { SiteFigures } from "./types"

/**
 * Editable public headline figures.
 *
 * The figures appear in several places on a single page (hero, footer, stat
 * strips), and some of those live inside client components on client-rendered
 * pages, so threading a server-fetched prop through every call site is not
 * practical. Instead the request is made once per page load and shared by every
 * consumer via this module-level promise.
 */
let figuresPromise: Promise<SiteFigures> | null = null

function loadFigures(): Promise<SiteFigures> {
  if (!figuresPromise) {
    figuresPromise = siteFiguresApi.get()
  }
  return figuresPromise
}

/**
 * Read a headline figure.
 *
 * `fallback` is what renders on the server and on first paint, so the page is
 * never blank or wrong-looking while the request is in flight. If the API is
 * unreachable the fallback simply stays.
 */
export function useSiteFigure(key: string, fallback: number): number {
  const [value, setValue] = useState(fallback)

  useEffect(() => {
    let active = true
    loadFigures().then((figures) => {
      const next = figures?.[key]
      if (active && typeof next === "number") setValue(next)
    })
    return () => {
      active = false
    }
  }, [key])

  return value
}

/**
 * The count the CEO edits in admin. The fallback is the last figure that was
 * hardcoded across the site, so an API outage degrades to the old behaviour
 * rather than to zero.
 */
export function useFarmersTrained(): number {
  return useSiteFigure("farmers_trained", 93)
}
