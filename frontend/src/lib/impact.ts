/**
 * Outcomes data for the Impact page and homepage strip.
 *
 * The cohort label is confirmed real. Every field tagged `TODO_OWNER` is a
 * placeholder awaiting the owner's real figures — keep the honesty rule: no
 * projected or inflated numbers ship to production.
 *
 * NOTE: the live "farmers trained" headline is no longer sourced from here. It
 * is admin-editable via the `farmers_trained` site figure — see
 * `useFarmersTrained` in `lib/site-figures.ts` and the `<FarmersTrained />`
 * component. The 93 below is the historical Cohort 01 record, and the fallback
 * used when the API is unreachable.
 */

export interface Cohort {
  label: string
  period: string
  location: string
  farmersTrained: number
  topics: string[]
  verified: boolean
  /** true once the owner has confirmed every field on this row. */
  confirmed: boolean
}

export const COHORTS: Cohort[] = [
  {
    label: "Cohort 01",
    period: "TODO_OWNER", // e.g. "Q1 2026"
    location: "TODO_OWNER", // e.g. "Kwara State, Nigeria"
    farmersTrained: 93, // confirmed real
    topics: ["Breeding", "Nutrition", "Disease prevention", "Farm management"],
    verified: true,
    confirmed: false,
  },
]

export interface HeadlineStat {
  value: string
  label: string
  note: string
  /**
   * Set when the figure is admin-editable. `ImpactStrip` swaps these for a live,
   * animated `<FarmersTrained />` — `value` is only the static fallback.
   */
  key?: "farmers_trained"
}

export const HEADLINE_STATS: HeadlineStat[] = [
  { value: "93", key: "farmers_trained", label: "Farmers trained", note: "First cohort, delivered" },
  { value: "01", label: "Cohorts completed", note: "and counting" },
  { value: "4", label: "Core disciplines", note: "breeding to management" },
  { value: "0", label: "Naira to enroll", note: "open by design" },
]

export const totalFarmersTrained = COHORTS.reduce((n, c) => n + c.farmersTrained, 0)
