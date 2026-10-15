# Fantasy Forest Background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (inline). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a soft Disney-style seasonal fantasy forest background with a manual Xuân/Hạ/Thu/Đông switcher behind Starters game selection screens.

**Architecture:** A `FantasyForestBackground` layer stack (sky → mid forest → edge decor → particles) sits behind page content. Theme state lives in `useForestTheme` (localStorage). Integrate via a thin `ForestPageShell` wrapper on Starters pages so sidebar + UnitGameScreen sit above the background.

**Tech Stack:** Next.js App Router, React client components, TypeScript, Tailwind CSS, CSS `@keyframes` (no canvas/WebGL)

## Global Constraints

- Phase 1 only: Starters pages (`[slug]`, `[slug]/[part]`)
- Menu-safe: no decor over carousel safe zone; `pointer-events: none` on decor
- Persist theme: `localStorage` key `wewin_forest_theme`
- Default theme: `spring`
- Respect `prefers-reduced-motion`
- No changes to game card artwork or carousel logic

---

### Task 1: Theme config + hook

**Files:**
- Create: `frontend/app/components/games/forest-background/themes.ts`
- Create: `frontend/app/components/games/forest-background/useForestTheme.ts`

**Interfaces:**
- Produces: `ForestSeason`, `FOREST_THEMES`, `useForestTheme()` → `{ theme, setTheme, config }`

- [x] Write `themes.ts` with season configs (gradients, accents, particle type)
- [x] Write `useForestTheme` with localStorage sync and SSR-safe default

---

### Task 2: Background layers + switcher

**Files:**
- Create: `frontend/app/components/games/forest-background/FantasyForestBackground.tsx`
- Create: `frontend/app/components/games/forest-background/SeasonThemeSwitcher.tsx`
- Create: `frontend/app/components/games/forest-background/ForestPageShell.tsx`
- Create: `frontend/app/components/games/forest-background/index.ts`

- [x] Sky + edge SVG + particles in `FantasyForestBackground`
- [x] 4-button `SeasonThemeSwitcher`
- [x] `ForestPageShell` composes background + children + switcher

---

### Task 3: Integrate Starters pages

**Files:**
- Modify: `frontend/app/games/starters/[slug]/page.tsx`
- Modify: `frontend/app/games/starters/[slug]/[part]/page.tsx`

- [x] Wrap loaded UI in `ForestPageShell`
- [x] Keep loading/error states without forest (or with shell optional)

---

### Task 4: Verify

- [x] Dev server: switch seasons, refresh persists theme
- [x] Cards remain readable; no overlap on desktop
