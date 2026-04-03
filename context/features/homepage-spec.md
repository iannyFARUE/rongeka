# Homepage Spec

## Overview

Build the public-facing marketing homepage at `/` (the root route). It replaces the current redirect and serves as the entry point for unauthenticated users. Authenticated users who visit `/` should be redirected to `/dashboard`.

Reference the prototype at `prototypes/homepage/` for visual design, copy, and layout.

## Route & Auth

- Route: `app/(marketing)/page.tsx` (new route group)
- Layout: `app/(marketing)/layout.tsx` — no sidebar, no top bar
- If session exists, redirect to `/dashboard` (check in the page server component using `auth()`)

## Sections

### 1. Navbar (Client Component)
- Fixed top, dark background with blur/border
- Logo (⚡ Rongeka) links to `/`
- Nav links: Features, AI, Pricing — smooth scroll to `#features`, `#ai`, `#pricing`
- **Sign In** button → `/sign-in`
- **Get Started Free** button → `/register`
- Collapses to hamburger on mobile

### 2. Hero (Server Component)
- Eyebrow: "Developer Knowledge Hub"
- H1 with gradient text: "Stop Losing Your Developer Knowledge"
- Subtext from prototype
- **Start for Free** → `/register`
- **See Features** → smooth scroll to `#features`

### 3. Chaos → Order Visual (Client Component)
- Three-panel layout: chaos box | arrow | dashboard preview mockup
- Chaos box: animated canvas with bouncing/floating brand icons (use simple SVG icons, not Simple Icons CDN)
- Arrow with pulsing animation and "Organize" label
- Dashboard preview: static mockup showing sidebar nav items and item cards (matching item type colors from project overview)
- Scroll fade-in on enter

### 4. Features Grid (Server Component)
- Section id: `features`
- 6 feature cards in a 3-col grid (2-col md, 1-col mobile):
  1. Code Snippets — blue (`#3b82f6`)
  2. AI Prompts — amber (`#f59e0b`)
  3. Instant Search (Cmd+K) — indigo (`#6366f1`)
  4. Commands — cyan (`#06b6d4`)
  5. Files & Docs — slate (`#94a3b8`)
  6. Collections — green (`#22c55e`)
- Each card: colored icon background, colored heading, description

### 5. AI Section (Server Component + Client Component for code mockup animation)
- Section id: `ai`
- Two-column layout: text left, code editor mockup right
- "✨ Pro Feature" badge
- Checklist of AI features (from prototype)
- **Unlock AI Features →** button → `/register`
- Code editor mockup: static VS Code–style block with TypeScript snippet and animated AI-generated tags appearing below (Client Component for the tag animation)

### 6. Pricing (Client Component — monthly/yearly toggle)
- Section id: `pricing`
- Monthly/Yearly toggle switch (client state); yearly saves ~25%
- Two cards: Free and Pro
  - Free: $0/mo, limits from project overview, **Get Started Free** → `/register`
  - Pro: $8/mo or $6/mo billed yearly ($72/yr), features from project overview, **Get Pro** → `/register`
- Pro card highlighted with border/glow

### 7. CTA Section (Server Component)
- Full-width dark section
- Heading + subtext from prototype
- **Start for Free — No Credit Card** → `/register`

### 8. Footer (Server Component)
- Logo + tagline
- Four columns: Product (Features, Pricing, AI Features), Resources (Documentation, API, Blog, Status), Company (About, Privacy, Terms, Contact)
- All footer links are `href="#"` placeholders for now except anchored section links
- Bottom bar: copyright (dynamic year) + "Built for developers, by developers."

## Component Structure

```
app/(marketing)/
  layout.tsx              # Minimal layout (no dashboard chrome)
  page.tsx                # Server component, redirects if authed
components/marketing/
  Navbar.tsx              # Client component (scroll state, mobile menu)
  HeroChaosVisual.tsx     # Client component (canvas animation)
  AiTagsDemo.tsx          # Client component (tag fade-in animation)
  PricingSection.tsx      # Client component (monthly/yearly toggle)
```

All other sections are inline server components in `page.tsx` or extracted as needed.

## Styling Notes

- Dark background (`bg-background`) matching the dashboard aesthetic
- Gradient text via `bg-gradient-to-r` with `bg-clip-text text-transparent`
- Scroll fade-in: use `IntersectionObserver` in a small client hook or inline CSS `@keyframes`
- Use shadcn `Button` component for all CTAs
- Use Tailwind for all layout and spacing — no custom CSS files
- Reuse item type colors already defined in the project (snippet blue, prompt purple, etc.)

## Notes

- No data fetching needed — purely static marketing content
- Footer links (Changelog, Documentation, API, Blog, Status, About, Privacy, Terms, Contact) are `href="#"` placeholders
- Keep the canvas animation simple: floating colored dots or simple geometric shapes are fine if SVG brand icons are complex — the key effect is "chaotic scattered things"
