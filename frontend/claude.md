# Green Livestock Africa's Website - Development Instructions

## Project Overview
This is a Next.js 15 application for Green Life Africa. The site must be sleek, professional, and highly mobile-responsive with smooth animations and a cohesive visual identity. The core idea is to provide a rich showcase of livestock data, image/video gallery (infinite discovery) like pinterest with varied sizes, robust and deep search; deep AI integration using Open AI SDK.

The UI/UX must be modern; sleek; ultra-beautiful and professional and premium. Use best UI/UX practices.

## Technology Stack
- **Framework**: Next.js 16
- **Styling**: Tailwind CSS with customized colors and themes.
- **Animations**: Framer Motion (for sleek, performant animations)
- **Icons**: Lucide React
- **Language**: TypeScript
- **Assets**: Located in `/public` folder (images, SVGs, etc.)

## Design & Branding

### Color Palette
globals.css contains color customizations; use those for consistent styling.

Use these colors as the primary palette. Supplement with standard Tailwind utilities for secondary colors and states.

### Typography & Responsiveness
- **Mobile First Approach**: Design for mobile, scale up to desktop
- **Font Sizes on Mobile**: Use smaller font sizes for mobile devices (`text-sm`, `text-base` on mobile, scale to `text-lg`, `text-xl` on larger screens)
- Use Tailwind responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- Maintain readability across all screen sizes
- Default fonts: Geist Sans (--font-geist-sans), Geist Mono (--font-geist-mono)

### SEO
- Use Next.js metadata features for SEO
- Implement proper Open Graph and Twitter card metadata
- Use semantic HTML for better accessibility
- This application is aimed at being SEO-friendly; make sure you pay attention to that as well.

## Project Structure

### Components Organization
All components should be organized in `/src/components` by feature/section:
```
src/components/
├── ui/                          # Reusable base components
│   ├── button.tsx
│   ├── card.tsx
│   └── ...
├── ...
|...etc.
```

**Rules:**
- Each feature folder should have an `index.ts` for clean exports
- Keep component files focused and single-responsibility
- Use `'use client'` directive only when necessary (Framer Motion, interactivity)

### Asset References
- All assets stored in `/public` folder
- Reference images: `/home/`, `/svg/`, `/meta/`, `/shared/`
- Use relative paths: `src="/home/logo.png"` or `<Image src="/home/logo.png" />`

## Development Best Practices

### Next.js 15 Standards
- Use App Router (no Pages Router)
- Leverage Server Components by default
- Use dynamic imports with `next/dynamic` for code splitting
- Optimize images with Next.js Image component
- Implement proper metadata in `layout.tsx`
- Use typed routes for better DX

### Styling
- Use Tailwind CSS utilities exclusively
- Apply branded colors for brand consistency
- Avoid inline styles; use `@apply` in CSS modules if needed
- Ensure WCAG AA contrast compliance
- Mobile-first CSS strategy

### Animations
- Use Framer Motion for all animations
- Keep animations subtle and purposeful (200-600ms duration)
- Prefer `motion.div`, `motion.button`, etc. over custom wrappers
- Use `useInView()` for scroll-triggered animations
- Test animations on real mobile devices (may be resource-intensive)

### Icons
- Use Lucide React for all icons
- Example: `import { Menu, X, ArrowRight } from 'lucide-react'`
- Size consistently: `size={16}, size={24}, etc.` or `className="w-6 h-6"`
- Maintain icon color contrast with surrounding content

### Code Quality
- Strict TypeScript typing (no `any`)
- Component props should be typed interfaces
- Use meaningful variable/component names
- Keep functions pure and testable
- Avoid deeply nested conditional renders (extract to components)

### Mobile Responsiveness Checklist
- ✅ Test on actual mobile devices
- ✅ Touch targets minimum 44×44px
- ✅ Single-column layout on mobile
- ✅ Readable font sizes on small screens
- ✅ Optimized images for mobile (use `next/image`)
- ✅ Proper spacing and padding on mobile (use `p-4 md:p-6 lg:p-8`)
- ✅ Accessible navigation (consider mobile menu/hamburger, clean and professional icons)

## File Naming Conventions
- Components: PascalCase (`Hero.tsx`, `FeatureCard.tsx`)
- Utilities/Hooks: camelCase (`useScrollAnimation.ts`)
- Folders: kebab-case (`src/components/feature-name/`)
- Index files: `index.ts` for clean exports

## Performance
- Lazy load images and heavy components
- Use Next.js Image for automatic optimization
- Minimize Framer Motion transformations on main thread
- Keep bundle size in check; audit with `next/bundle-analyzer`
- Defer non-critical JavaScript with dynamic imports

## Deployment
- Target: Production-ready, fast-loading site
- Ensure all assets are optimized
- Test responsiveness on multiple devices before deployment
- Use `next build` and `next start` for production builds

## Key Commands
- `pnpm dev` - Development server
- `pnpm build` - Production build
- `pnpm start` - Run production build
- `pnpm lint` - Run linters

---

**Last Updated**: December 2025
**Status**: Active Development
