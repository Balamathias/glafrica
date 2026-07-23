# Green Livestock Africa — Education-First Repositioning: Design & IA

**Date:** 2026-07-23 · **Status:** Approved by owner (design plan, IA, copy direction)

## 1. Repositioning summary

From "invest in premium livestock" marketplace to an **education-first platform**: open
knowledge-sharing for livestock farmers across Africa as a direct answer to hunger and
food insecurity. Not a course funnel, not charity-coded — premium, investment-grade,
profession-dignifying. Aligns naturally with SDG 2, 4, 8, 17 (referenced, never oversold).

**The model:** `01 Enlighten → 02 Equip → 03 Verify → 04 Grow`
(open training → inputs/vets/genetics → verification of trained farmers' livestock →
marketplace as proof the model works).

**Anchor proof point:** 93 farmers trained in the first cohort. Delivered evidence, not a
marketing claim. Real numbers only, sitewide — no vague superlatives.

**Audiences:** smallholders, established operators, young/aspiring farmers — tiered
messaging ("new to farming" vs "already farming"), plus sponsors/partners/investors.

## 2. Design concept: "Field & Ledger"

The brand must prove two things: **beauty** (animals, land, cinematic video) and **rigor**
(training, protocols, verified records). Every page alternates between two materials:

- **Field** — full-bleed cinematic sections (R2 video / hero imagery), minimal type,
  immersive.
- **Ledger** — contained, precise record surfaces: record cards, tabular mono data,
  stamped verification marks. Vernacular drawn from the subject itself: herd registries,
  vaccination cards, ear tags, the farmer's almanac — typeset to investment grade.

What this retires from the current site: glassmorphism on content cards (kept only on the
fixed navbar), glow/pulse effects, pure-black ground, floating KPI stat tiles.

### 2.0 Gradient charter (owner amendment, 2026-07-23)

The green→gold gradient is part of GLA's signature and is **preserved deliberately**:

- **Signature text gradient** (Pasture → Ochre): exactly ONE gradient phrase per page,
  on the emotional keyword of a headline (e.g. the hero's key phrase). Never on body
  text, buttons, or data.
- **Atmospheric gradients kept**: the hero video overlay stack (dark scrims for text
  contrast), the `HeroTransition` dark→background blend, and subtle
  background→muted section washes.
- **Retired**: `pulse-glow` / `shadow-glow` loops, shimmer on content (kept for loading
  skeletons), and per-card hover gradient washes (replaced by the record-card hover:
  border emphasis + lift).

### 2.1 Color tokens

| Token | Hex | Role |
|---|---|---|
| **Nightfield** | `#0B120C` | Dark ground — near-black with green cast; replaces pure `#000` for `--background` (dark) |
| **Canopy** | `#174024` | Deep forest green — section surfaces, footer, buttons on light |
| **Pasture** | `#76B041` | Existing brand primary (kept, ≈ current `oklch(69.78% .162 130.63)`) — the single live accent: CTAs, links, active states |
| **Vellum** | `#F4F1E8` | Warm record-paper — card/section material ONLY, never the page ground |
| **Ochre** | `#D9A441` | Existing secondary recast — reserved exclusively for verification stamps and impact numerals (scarcity = honesty encoded as a color rule) |

Dark mode remains default. Light mode shifts from clinical white toward warm paper tones
using Vellum-family surfaces.

### 2.2 Type system

- **Display: Playfair Display** (kept per owner decision) — with new restraint rules to
  escape the "luxury template" register:
  - h1/h2 page headlines and pull-statements only; h3 and below use Geist Sans semibold
    (this changes the current global `h1,h2,h3 { serif }` rule).
  - Weights 400/500/600 only (stop loading 700–900).
  - Gradient text only per the gradient charter (§2.0: one signature phrase per page);
    no decorative SVG underlines; tighter leading at large sizes.
- **Body/UI: Geist Sans** — kept; coherent with admin.
- **Records: Geist Mono, promoted to first-class voice** — every tag ID, schedule row,
  date, stat, cohort number is mono. Data on this site reads as *entries in a ledger*.

### 2.3 Component language

- **Record card**: Vellum or Nightfield surface, subtle border, mono metadata row
  (e.g. `ENTRY 04 · GOATS · NUTRITION`), no backdrop blur.
- **Tag chip**: ear-tag-shaped chip for categories/species.
- **Stamp**: ochre circular/oval mark, `GLA · VERIFIED` style; used only for delivered,
  verified facts.
- **Record line**: single-line mono ledger entry, e.g.
  `COHORT 01 · 93 FARMERS TRAINED · VERIFIED` — replaces glassy stat tiles in the hero.
- **Numbered markers** (01–04) used ONLY for the Enlighten→Equip→Verify→Grow pipeline,
  where order genuinely carries meaning. Nowhere else.

### 2.4 Signature element: The Herd Health Card

The vaccination schedule tool as the site's signature interactive moment (Learn page
centerpiece + homepage teaser module):

- User picks a species (goats, cattle, sheep, poultry, …) and optionally a birth/hatch
  date.
- DRF endpoint returns the protocol; frontend typesets it live as an official-feeling
  **herd health record card**: week-by-week mono ledger rows (age, vaccine, disease,
  route, notes), dated when birth date given, ochre "GLA Herd Health Protocol" stamp,
  print/download friendly.
- A real working tool demonstrating veterinary expertise — the Equip pillar, rendered.

### 2.5 Motion & quality floor

- One orchestrated hero load sequence; scroll-reveals restrained; no ambient glow loops.
- `prefers-reduced-motion` respected everywhere (including video autoplay fallback to
  poster).
- Responsive down to mobile; visible keyboard focus; WCAG AA contrast.

### 2.6 Generic-default self-critique (recorded)

1. *Dark + neon accent* (the current site's look): biggest residual risk. Mitigated by
   green-cast ground, Vellum ledger sections, mono data voice, retiring glass/glow.
   Evolves brand equity rather than resetting it.
2. *Cream + high-contrast serif + terracotta*: Vellum constrained to card material inside
   dark/green pages; no terracotta anywhere.
3. *Numbered markers*: earned only by the real 4-step pipeline.
4. *Stat-tile hero*: replaced by the stamped record line.

## 3. Information architecture

| Route | Status | Content |
|---|---|---|
| `/` | Rebuilt | Education-first hero → 4-pillar model → Herd Health Card teaser → impact ledger strip → marketplace reframed as proof → farmer-first testimonials → map/CTA |
| `/learn` | New — primary nav destination | Knowledge hub: guidance by livestock type (breeding, nutrition, disease prevention, bloat), workshops/on-farm sessions, **Herd Health Card** tool |
| `/livestock` | Kept | Marketplace; copy reframed: "livestock raised by trained, equipped farmers" |
| `/store` | New | Farm Store: absorbs eggs vertical (`/eggs` redirects here) + exotic chickens, tilapia fingerlings, grass seed, general sourcing — "what a trained farmer needs to start or grow". **Inquiry-based, not orderable** (owner, 2026-07-23): no prices/carts; every product card leads to a prefilled inquiry ("sourcing desk" pattern) wired to the ContactInquiry pipeline |
| `/impact` | New | Plain-stated outcomes ledger for sponsors: cohort table, what was taught, real numbers only |
| `/partner` | New | Partner With Us: sponsor / foreign development partner / investor paths + DRF-backed inquiry form |
| `/about` | Reframed | The people teaching and backing farmers; team stays; mission copy rewritten |
| `/contact` | Kept | As is |

**Nav:** `Learn · Livestock · Farm Store · Impact · About` — navbar CTA button becomes
**"Partner With Us"** (replacing "Explore Now"). Farmers get the whole site; the one CTA
slot goes to the audience that funds the mission.

**Testimonials:** farmer voices first, then existing investor/breeder voices.

## 4. Copy direction (approved)

**Hero headline (owner's direction):**
> **Building the next generation of African farmers.**
Sub: *Open training in breeding, nutrition, and disease prevention — knowledge as the
working answer to hunger and food insecurity across Africa. 93 farmers trained in our
first cohort.*
Record line: `COHORT 01 · 93 FARMERS TRAINED · VERIFIED`

**Voice rules:** premium and investment-grade, never charity/NGO register. Farming as a
serious, prestigious profession. Honest specificity: real numbers, no vague superlatives,
no projected/inflated claims. Tier messaging for "new to farming" vs "already farming"
rather than one generic pitch. SDG alignment referenced where it fits, not oversold.

## 5. Backend additions

- **Models:** `Species` (name, slug) + `VaccinationEvent` (species FK, vaccine, disease,
  age_offset_days, repeat_interval_days nullable, route, notes, sort order). Seeded via
  fixture/migration; admin-editable later.
- **Endpoint:** public `GET /api/vaccination-schedule/?species=<slug>&birth_date=<iso>` →
  ordered schedule; when birth_date present, concrete dates are computed.
- **Partner inquiries:** extend the ContactInquiry pipeline with an inquiry type
  (partner/sponsor/general) or a parallel serializer path; reuse rate limiting + email.

## 6. Asset rules

- **Video:** Cloudflare R2 direct URLs in `<video>` sources — never proxied through DRF
  (Vercel 4.5MB body cap). Poster images local (webp frames in `/public`).
- **Images:** compressed/resized into `frontend/public/`, referenced via `next/image`
  with static imports (width/height inferred).

### 6.1 R2 video inventory & casting (verified live 2026-07-23)

Base: `https://pub-ae60aabd58e04ea3b36fa57df124c761.r2.dev/compressed/`

| File | Size | Cast |
|---|---|---|
| `goats_sahel.mp4` | 1.3 MB | Homepage hero (light enough to `preload="auto"`) |
| `feeding_cattle.mp4` | 16 MB | `/learn` hero / Enlighten field section — lazy, `preload="none"`, play on intersection |
| `little_chicks.mp4` | 5.7 MB | Farm Store hero (fertile eggs / exotic chickens) — lazy |
| `fishes_in_pond.mp4` | 30 MB | Tilapia section field-break — lazy; **candidate for recompression** (30 MB is heavy even lazy) |

Loading discipline: only the in-viewport video plays (IntersectionObserver play/pause);
below-fold videos `preload="none"` with local poster; `prefers-reduced-motion` shows
poster only; never more than one video decoding per viewport.

## 7. Open inputs needed from owner

1. ~~Cloudflare R2 video URLs~~ — received, see §6.1.
2. Real cohort facts for `/impact` and record lines: dates, location(s), topics taught,
   any metrics beyond "93 farmers trained".
3. ~~Farm Store product realities~~ — inquiry-based, not orderable (see IA table).
4. Farmer testimonial quotes (real names/photos, or how to attribute).
5. Vaccination protocol source data per species (or approve drafting from standard
   veterinary references for owner review before publish).
