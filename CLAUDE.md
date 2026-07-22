# CLAUDE.md - Green Livestock Africa Context

## Project Overview
**Green Livestock Africa** is a premium web platform for showcasing and selling high-quality livestock.
- **Goals**: Investor-focused, visually stunning (Pinterest-style), deep AI integration.
- **Vibe**: Immersive, luxurious, earthy, professional.

## Developer Commands
- **Backend (Django)**:
    - Run Server: `uv run python manage.py runserver`
    - Migrations: `uv run python manage.py migrate`
    - Shell: `uv run python manage.py shell`
    - Sync deps: `uv sync`
    - Lint: `uv run ruff check .` (add `--fix` to auto-fix)
    - Format: `uv run ruff format .`
- **Frontend (Next.js)**:
    - Dev Server: `pnpm dev`
    - Build: `pnpm run build`
    - Type Check: `pnpm tsc --noEmit`

### Local Backend Environment
- `backend/.env` (gitignored) drives local config; copy from `backend/.env.example` to bootstrap.
- **DB toggle**: `DB_MODE` in `.env` switches the database:
    - `local` (default in `.env`) → connects to the local Postgres instance (`glafrica` db, `DB_NAME`/`DB_USER`/etc. vars).
    - `prod` → falls through to the original `DB_URL`/`dj_database_url` path, identical to what Vercel uses (Vercel never sets `DB_MODE`, so prod deploys are unaffected by this toggle either way).
    - To point local dev at prod data, set `DB_MODE=prod` and paste the real `DB_URL` from the Vercel project env vars into `.env` — never commit it.
- **Local Postgres**: Homebrew Postgres running locally; database created via `createdb glafrica` (trust auth, no password, user = local OS user).
- `requirements.txt` / `vercel.json` / `build_files.sh` are the Vercel build path — do not need to change for local dev; `pyproject.toml`/`uv.lock` are the local `uv` path. Keep both in sync manually if you add a new dependency.

## Tech Stack
- **Backend**: Django 5.x, Django REST Framework, PostgreSQL (pgvector support), Cloudinary.
- **Frontend**: Next.js 15 (App Router), Tailwind CSS, Framer Motion, Zustand, React Query (planned).
- **AI**: OpenAI SDK (GPT-4o), RAG (Retrieval Augmented Generation), Vector Search (pgvector).
- **Styling**: `next-themes` (Dark/Light), `shadcn/ui` (planned foundation), `lucide-react` (Icons).

## Design System & Branding
- **Typography**:
    - Headings: `Playfair Display` (Serif) - Adds premium/luxury feel.
    - Body: `Geist Sans` (Sans-Serif) - Modern, clean legibility.
- **Colors**:
    - **Primary**: Deep Forest Green (defined in `globals.css` variable `--primary`).
    - **Dark Mode**: "True Black" background (`#000000` or very deep neutral).
    - **Light Mode**: Warm, paper-like or clean tones.
- **UI Patterns**:
    - **Glassmorphism**: Backdrop blur on overlays (Sidebar, Chat, Cards).
    - **Masonry Layout**: Custom/Library-based infinite grid for mixed media (Video/Image).
    - **Micro-interactions**: Hover states, smooth page transitions.

## Implementation Details

### Backend Structure (`backend/`)
- **Apps**: `api` (core domain + public API), `api/admin_api` (admin dashboard endpoints), `api/authentication` (JWT auth endpoints).
- **Models** (`api/models.py`):
    - `Livestock` / `MediaAsset` / `Category` / `Tag`: Core catalog. `Livestock.embedding` (VectorField) still commented out — *pgvector remains disabled*.
    - `Egg` / `EggCategory` / `EggMediaAsset`: Second product vertical (poultry/eggs), fully modeled with its own gallery + admin CRUD.
    - `UserProfile`: Extended user data.
    - `ContactInquiry`: Inbound contact form submissions, managed via `admin/inquiries`.
    - `PageView` / `VisitorSession`: Visitor analytics/tracking.
    - `AuditLog`: Admin action auditing.
- **Services**: `api/services/ai.py` (AIService, OpenAI), `api/services/analytics.py` (visitor tracking), `api/services/email.py` (transactional email).
- **Views**: `LivestockViewSet` (CRUD + `search_ai`), `ChatView` (AI chat), plus `admin_api` dashboard views for livestock/eggs/tags/categories/users/inquiries/analytics.

### Frontend Structure (`frontend/`)
- **Public routes** (`src/app/`): `/`, `/livestock`, `/eggs`, `/search`, `/about`, `/contact`.
- **Admin routes** (`src/app/admin/`): `login`, `livestock`, `eggs`, `tags`, `categories`, `media`, `users`, `inquiries`, `analytics`, `visitor-analytics` — a full admin dashboard, not just a plan anymore.
- **Layout**:
    - `Sidebar` (`components/layout/sidebar.tsx`): Collapsible, responsive navigation. Persists state via `useUIStore`.
    - `MainLayout` (`components/layout/main-layout.tsx`): Wraps page content, adjusts margins based on sidebar.
    - `ChatAssistant` (`components/ai/chat-assistant.tsx`): Global floating AI widget.
- **Gallery**: `InfiniteGallery` / `GalleryCard` (livestock masonry grid), mirrored by `components/eggs/*` for the eggs vertical (immersive gallery, filter bar, detail modal).
- **Admin components**: `components/admin/*` — dedicated CRUD UI (create/edit/view modals) for livestock, eggs, tags, categories.
- **State**: `zustand` store in `lib/store.ts` for UI state (sidebar).

## Current Status (as of 2026-07-22)
- **Backend**: Functional and deployed on Vercel (`vercel.json` + `build_files.sh`). Livestock + Eggs catalogs, admin API, JWT auth, visitor analytics, contact inquiries, and audit logging all live. Vector search still disabled — `embedding` field commented out on `Livestock`.
- **Frontend**: Functional. Public gallery/detail experience for both Livestock and Eggs, plus a full admin dashboard (CRUD, analytics, media, users, inquiries).
- **Local dev**: `uv run` fully wired up with a togglable local/prod Postgres (`DB_MODE` in `backend/.env`, see Developer Commands above).
- **Note**: git history shows no commits between late Feb 2026 and now (2026-07-22) — worth confirming this clone is current before assuming that's the real last state of the project.
- **Next Steps**:
    1. Re-enable `pgvector` and wire up real embedding-based search (`search_ai` is currently a text fallback).
    2. Reconcile `requirements.txt` (psycopg2-binary, Vercel build) vs `pyproject.toml` (psycopg3) — works today but is a latent drift to watch.
    3. Remove/clean up the corrupted `backend/requirements.tx` file (UTF-16 artifact, distinct from `requirements.txt`).
    4. Decide next feature priority (see brainstorm).

## Brand Asset Checklist & Design Reference
*Reference for Future Agents & Designers*

### 1. Logo Suite (SVG Format Preferred)
- **Primary Logo (Full)**: The complete logo with icon and text.
    - *Need*: 1 version for Light Mode (e.g., dark text) and 1 for Dark Mode (e.g., white text).
- **Logomark (Icon Only)**: Just the symbol/icon (e.g., the leaf/livestock head).
    - *Usage*: Favicon, Mobile Header, AI Chat Floating Button, Loading Spinner.
- **Watermark/Monogram**: A subtle, low-opacity version for background textures or image overlays.

### 2. Color Palette & System
- **Primary Brand Color**: The main color defining the brand (e.g., a specific Deep Forest Green).
- **Secondary/Accent Color**: A punchy color for Call-to-Actions (e.g., Gold, Terra Cotta, or a vibrant Lime).
- **Surface Tones**:
    - *Warmth*: "Clinical White/Gray" vs "Warm Paper/Sand" tones for light mode.
    - *Depth*: "True Black" or "Deep Charcoal/Midnight Green" for dark mode.

### 3. High-Fidelity Imagery (The "Vibe")
- **Atmospheric Hero Media**:
    - *Video*: 4K, slow-motion, cinematic loop (5-10s) of a landscape or livestock grazing close-up. (No sound).
    - *Image*: High-res wide shots with negative space for text.
- **Textures / Organics**:
    - Subtle background textures (e.g., grain, paper fiber, faint topographic lines, or organic cell patterns) to break up flat digital colors and add "tactility".

### 4. Livestock "Glamour Shots" (For Gallery Testing)
- **Portrait Mode**: 5-10 high-quality images of livestock with *blurred backgrounds* (depth of field).
- **Diverse Ratios**: A mix of Tall (Portrait), Wide (Landscape), and Square images to test the masonry layout.
- **Short Video Clips**: 3-5 vertical short videos (Reels/TikTok style) to test the video mixing in the gallery.

### 5. Typography
- **Default**: `Geist Sans` (modern, clean) and `Geist Mono`.
- **Display Font**: `Playfair Display` (Serif) for Headings to separate the brand from generic tech sites.

### 6. Copywriting Elements
- **Tagline**: Short, punchy phrase (e.g., "The Future of Livestock Investing").
- **Welcome Message**: The first thing the AI Chatbot says (e.g., "Welcome to Green Livestock. How can I assist your investment journey today?").

SEE the "public" directory for most of these assets. See /atmospheric, see /logo, etc.
