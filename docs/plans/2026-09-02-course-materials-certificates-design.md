# Course Materials, Certificate Directory & Configurable Impact Count — Design

**Date:** 2026-09-02 · **Status:** Approved by owner — implemented on branch `docs/course-materials-certificates-design`

Follows on from [2026-07-23 Education-First Repositioning](./2026-07-23-education-first-repositioning-design.md).
Three CEO-requested changes, designed together because they share an admin surface and a
data story.

## 1. Summary of the three asks

1. **Replace the vaccination section with downloadable course material PDFs** (~7 to
   start).
2. **Certificate management**: the secretary uploads training certificates in admin; the
   public can look up and download a certificate by the holder's name or phone number.
3. **Make "93 farmers trained" configurable** from admin, and animate it counting up on
   the public site.

### What "the vaccination section" actually is

The Herd Health Card — a species + birth-date → vaccination schedule generator. It spans
more than one file:

| Surface | Location |
| --- | --- |
| Public section (`#herd-health`) | `frontend/src/app/learn/page.tsx:117` |
| Home page teaser | `frontend/src/components/home/herd-health-teaser.tsx` |
| Brand component | `frontend/src/components/brand/herd-health-card.tsx` |
| Admin CRUD | `frontend/src/app/admin/herd-health/page.tsx` |
| Models | `Species`, `VaccinationEvent` — `backend/api/models.py:601,626` |

## 2. Decisions taken

| Decision | Chosen | Rationale |
| --- | --- | --- |
| Certificate lookup model | **Search-only, no browsable list** | A public list of farmer names beside phone numbers is a scraping target. Search-only gives the CEO the verification capability without publishing the phone book. |
| Fate of Herd Health Card | **Unpublish UI, keep data** | Remove the public section and teaser; keep the models, admin page and endpoints intact. Reversible, small diff, nothing destroyed. |
| Certificate ingestion | **One-at-a-time form + drag-drop PDF** | Matches existing admin modals, ships fastest. Back-entering ~93 records is a one-time cost the secretary can batch. |
| Source of the count | **Admin-editable single number** | Stays truthful for farmers trained before certificates were digitised. A derived count would read 0 on launch day. |
| Secretary access | **Certificate rights added to existing `staff` role** | Owner chose speed over a new role. See §7 for the accepted trade-off. |

## 3. Data model

Three new models in `backend/api/models.py`, all extending `TimeStampedModel`.

### `CourseMaterial`

`title`, `slug`, `summary`, `topic`, `file`, `file_size_bytes`, `page_count` (nullable),
`sort_order`, `is_published`, `download_count`.

- `topic` uses choices mirroring the four existing `TOPICS` on `/learn`: Breeding,
  Nutrition, Health, Management.
- `file` is a Cloudinary field with `resource_type="raw"` (PDFs are not images).
- `sort_order` is manual — the CEO controls the curriculum sequence.

### `Certificate`

`id` (UUID pk), `holder_name`, `phone`, `phone_normalized`, `certificate_number`
(unique), `cohort`, `programme`, `issued_on`, `file`, `is_published`, `created_by`.

- **UUID primary key** so certificate URLs are not enumerable.
- **`phone_normalized` is the search key and must be indexed.** Normalisation strips all
  non-digits and reduces to the last 10 digits, so `0801 234 4521`, `08012344521` and
  `+2348012344521` all converge on one value. Getting this wrong is the most likely
  source of "my certificate isn't there" reports.
- Index `holder_name` for name search.
- `certificate_number` format: `GLA-<year>-<zero-padded sequence>`, e.g. `GLA-2026-0093`.

### `SiteFigure`

`key`, `integer_value`, `text_value`, `updated_by`.

A small key/value table rather than a one-row singleton. First key is `farmers_trained`.
When the next figure is requested ("communities reached", "cohorts delivered"), it is a
row insert rather than a migration.

## 4. API surface

### Public — `backend/api/urls.py`, no auth

| Endpoint | Behaviour |
| --- | --- |
| `GET /api/course-materials/` | Published materials, ordered by `sort_order`. Read-only ViewSet. |
| `GET /api/course-materials/<slug>/download/` | 302 to the Cloudinary file, increments `download_count`. |
| `GET /api/certificates/lookup/?q=` | The **only** certificate read endpoint. |
| `GET /api/certificates/<uuid>/download/` | 302 to the file. |
| `GET /api/site-figures/` | `{"farmers_trained": 147}` |

There is deliberately **no `GET /api/certificates/`**. No public route returns more than
one search's worth of records.

### Lookup endpoint rules

These four rules are what make the search-only model actually hold:

1. **Minimum query length of 3.** Blank or 1–2 character queries return `400`, never a
   full result set.
2. **Digits → exact match on `phone_normalized`. Text → `icontains` on `holder_name`.**
   Phone lookup is exact only: you either know the number or you get nothing.
3. **Capped at 10 results, no pagination cursor.** A common surname returns the first ten
   with a "refine your search" note. There is no mechanism to page through the population.
4. **Throttled** via a `CertificateLookupRateThrottle(AnonRateThrottle)` at 20/min per
   IP — matching how `ContactRateThrottle` is already done in this codebase. Ample for a
   farmer finding their own record; useless for enumerating a name dictionary.

The public serializer returns `phone_masked` (`080****4521`) and **never** the raw
`phone` field. Masking is server-side — the full number must not be present in the JSON
payload.

### Admin — `backend/api/admin_api/`

Standard ViewSets for certificates, course materials and site figures, guarded by new
`CanManageCertificates` / `CanManageCourseMaterials` permission classes. Add
`certificate.view/add/change/delete` and `course.view/add/change` to the `staff` and
`admin` entries in `UserProfile.ROLE_PERMISSIONS` (`models.py:326`). All writes recorded
through the existing `AuditLog`.

## 5. Public frontend

### `/learn`

The `#herd-health` section (`learn/page.tsx:117-145`) is replaced by `#course-materials`:
a grid of seven cards showing topic tag, title, summary, page count and file size, with a
download button. Cards group under the four existing topic headings so the set reads as a
curriculum rather than a file dump.

Remove the `HerdHealthCard` import here and the `herd-health-teaser` usage on the home
page. Both component files stay on disk, unlinked.

### `/certificates` — new public page

Field-hero, then a single prominent search input: *"Enter your name or phone number."*

- **Empty state** explains what the directory is and that it only responds to a specific
  search.
- **Results** render as ledger-style cards using the existing `RecordLine` / `EarTag`
  brand components, with the masked phone as a "yes, this is me" confirmation and a
  download button.
- **Zero results** is a plain "No certificate found for that name or number" with a link
  to `/contact` — not an error state. A farmer trained before digitisation will
  legitimately land here.

### The count-up

A `<CountUp>` client component:

- `IntersectionObserver` so it fires on scroll into view, not on mount, for below-fold
  instances.
- `requestAnimationFrame` with an ease-out curve over ~1.6s.
- Renders the final value immediately when `prefers-reduced-motion: reduce` is set.

Wired into the five places the number currently appears as a live figure:
`about/page.tsx:49`, `about/page.tsx:194`, `impact/page.tsx:40`,
`components/home/hero.tsx:120`, `components/layout/footer.tsx:127`, sourced through
`lib/impact.ts:25`.

**The two metadata descriptions that hardcode the number** (`app/page.tsx:23`,
`app/impact/page.tsx:12`) have the figure removed rather than made dynamic. Static
metadata that silently goes stale is worse than metadata that makes no numeric claim.

## 6. Admin frontend

Two new routes following existing `/admin/*` conventions (`PageHeader`, table + modal
CRUD, client functions in `lib/admin-api.ts`).

### `/admin/certificates`

Table: holder name, masked phone, cohort, programme, issue date, published state.
Server-side filtered search box. "Add certificate" opens a modal with name, phone, cohort,
programme, issue date and a drag-drop PDF field; edit and delete reuse the same form.

Admin-side listing shows the **full** phone — staff need it to disambiguate people. This
is precisely why the admin endpoint sits behind auth and the public one never returns it.

Two guards on the form:

- **Duplicate warning** when the normalised phone already exists. Re-training is
  legitimate, but silent duplicates make public lookup confusing.
- **PDF-only validation** with a file size ceiling.

### `/admin/course-materials`

Table: title, topic, order, published, download count. Drag-to-reorder, or a plain order
field if reordering fights the existing table patterns. Same drag-drop upload.

### Site figures

A `farmers_trained` number input, either at `/admin/settings` or as a card on the existing
dashboard, showing who last changed it and when.

### Sidebar

`components/layout/sidebar.tsx` gets both entries, rendered conditionally on a permission
check rather than a hardcoded link list.

## 7. Accepted trade-off: the secretary's role

The owner chose to grant certificate rights to the existing `staff` role rather than
introduce a `secretary` role. The consequences, stated plainly:

- Every `staff` account gains certificate and course-material rights.
- The secretary retains `livestock.add` / `livestock.change` she has no use for.

Mitigation: because the sidebar renders off permission checks rather than hardcoded
links, promoting this to a real least-privilege `secretary` role later is a one-line
addition to `ROLE_PERMISSIONS` plus the permission list — no UI rework.

## 8. Testing

Backend:

- Phone normalisation across all three input formats resolves to one value.
- Lookup rejects queries under 3 characters.
- Lookup response never contains the raw `phone` field.
- Lookup caps at 10 results.
- Throttle fires past the configured rate.
- Unauthenticated writes to the admin endpoints are rejected.

Frontend:

- `<CountUp>` renders the final value immediately under `prefers-reduced-motion`.
- Lookup zero-state renders the guidance copy, not an error.

## 9. Rollout

Entirely additive — new models, new routes, no destructive migration — so it ships in a
single deploy. Two manual steps:

1. **The CEO sets `farmers_trained` before launch**, or the public site animates to 0.
2. The secretary back-enters the existing certificate records. The public `/certificates`
   page is honest in the meantime: it reports no match rather than a wrong count, because
   the impact figure is independent of how many PDFs have been uploaded.
