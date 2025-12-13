# CLAUDE.md - Green Livestock Africa Context

## Project Overview
**Green Livestock Africa** is a premium web platform for showcasing and selling high-quality livestock.
- **Goals**: Investor-focused, visually stunning (Pinterest-style), deep AI integration.
- **Vibe**: Immersive, luxurious, earthy, professional.

## Developer Commands
- **Backend (Dijango)**:
    - Run Server: `uv run python manage.py runserver`
    - Migrations: `uv run python manage.py migrate`
    - Shell: `uv run python manage.py shell`
- **Frontend (Next.js)**:
    - Dev Server: `pnpm dev`
    - Build: `pnpm run build`
    - Type Check: `pnpm tsc --noEmit`

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
- **App**: `api`
- **Models**:
    - `Livestock`: Core entity. Includes `embedding` (VectorField - *temporarily disabled until DB supports pgvector*), `vaccination_history` (JSON).
    - `MediaAsset`: Handles multiple files per livestock. Supports `image` and `video` types with `aspect_ratio` for masonry layout.
    - `Category`: Hierarchical organization.
- **Services**: `api/services/ai.py` (AIService class) handles OpenAI interactions.
- **Views**:
    - `LivestockViewSet`: CRUD + `search_ai` action (currently text fallback).
    - `ChatView`: AI Chat endpoint.

### Frontend Structure (`frontend/`)
- **Layout**:
    - `Sidebar` (`components/layout/sidebar.tsx`): Collapsible, responsive navigation. Persists state via `useUIStore`.
    - `MainLayout` (`components/layout/main-layout.tsx`): Wraps page content, adjusts margins based on sidebar.
    - `ChatAssistant` (`components/ai/chat-assistant.tsx`): Global floating AI widget.
- **Gallery**:
    - `InfiniteGallery` (`components/gallery/infinite-gallery.tsx`): Responsive masonry grid with infinite scroll.
    - `GalleryCard` (`components/gallery/gallery-card.tsx`): Displays Media. Hover effects, Video playback.
- **State**: `zustand` store in `lib/store.ts` for UI state (sidebar).

## Current Status (as of 2025-12-13)
- **Backend**: Functional. Models/API ready. Vector Search disabled (commented out in models).
- **Frontend**: Functional. core Layout, Gallery, and Chat UI implemented.
- **Next Steps**:
    1. Fix Build Errors (TypeScript/Lint).
    2. Implement `Livestock Detail` page (`/livestock/[id]`) (Make this to open in an advanced and complex premium modal instead)
    3. Re-enable `pgvector` when environment allows.
    4. Implement Admin Dashboard.

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
