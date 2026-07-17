# Fantasy Forest Seasonal Background — Design Spec

**Date:** 2026-07-17  
**Status:** Approved concept, pending implementation plan  
**Scope:** Game selection screens (`UnitGameScreen` / `GameMenu` menu view) across book types (Starters, Kids, Movers, Flyers)

---

## 1. Goal

Replace the plain white/gray background behind the game carousel with a **soft Disney-style fantasy forest** atmosphere. Users can manually switch between four seasonal themes (Spring, Summer, Autumn, Winter). The background must feel immersive without competing with game cards, sidebar, or UI controls.

**Design direction (approved):** Soft Storybook layout + distinct seasonal identity per theme + manual theme switcher.

---

## 2. Non-Goals

- Changing game card artwork or carousel behavior
- Full-screen parallax on mobile (performance)
- Random or unit-based auto theme switching (future enhancement only)
- Background inside individual game play views (phase 1: menu view only)

---

## 3. Layout Zones

The screen is divided into safe zones so decorative objects never overlap critical UI.

```
┌─────────────────────────────────────────────────────────────┐
│ [Sidebar]  │  TOP BAR (breadcrumb, back, theme switcher)    │
│            │─────────────────────────────────────────────────│
│            │         SKY LAYER (gradient + light rays)       │
│            │    ┌─────────────────────────────────────┐     │
│  (fixed)   │ L  │                                     │  R  │
│            │ E  │     SAFE ZONE — game carousel       │  I  │
│            │ F  │     (no decorative overlap)         │  G  │
│            │ T  │                                     │  H  │
│            │    └─────────────────────────────────────┘     │
│            │         GROUND LAYER (grass, mushrooms)         │
│            │              [UnitProgress pill]                │
└─────────────────────────────────────────────────────────────┘
```

| Zone | Purpose | z-index (relative) |
|------|---------|-------------------|
| Sky | Gradient sky, distant castle/silhouette, sun/moon glow | 0 |
| Mid forest | Blurred tree trunks, mist, light beams | 1 |
| Near decor | Mushrooms, flowers, vines at screen edges | 2 |
| Particles | Petals, leaves, snow, fireflies (CSS/SVG animation) | 3 |
| Content | GameMenu, breadcrumb, sidebar, progress | 10+ |
| Theme switcher | Floating pill, top-right on desktop; toolbar area on mobile | 20 |

**Safe zone:** Center ~60% width, vertical band from below breadcrumb to above progress pill. All decorative assets use `pointer-events: none` and stay outside this band.

---

## 4. Season Themes

Each theme defines: palette, sky, mid-layer silhouettes, edge objects, particle type, ambient mood.

### 4.1 Spring (Xuân)

| Property | Value |
|----------|-------|
| Mood | Fresh, hopeful, cherry-blossom fairy tale |
| Sky gradient | `#E8F4FF` → `#FFE8F0` → `#FFF5E6` |
| Accent colors | Sakura pink `#FFB7C5`, leaf green `#7BC67E`, gold sparkle `#FFD966` |
| Mid layer | Soft green hills, distant fairy-tale castle silhouette (15% opacity) |
| Left/right edge | Curved willow/cherry trees with pink blossoms, vines with small buds |
| Ground | Light green grass tufts, pink/white mushrooms, small wildflowers |
| Particles | Cherry petals (8–12), slow drift + slight rotation; 3–5 butterflies |
| Light effect | Warm morning rays from top-left, very subtle |
| Switcher icon | 🌸 Cherry blossom |

### 4.2 Summer (Hạ)

| Property | Value |
|----------|-------|
| Mood | Lush, bright, magical midday forest |
| Sky gradient | `#87CEEB` → `#B8E6FF` → `#E8FFF0` |
| Accent colors | Forest green `#2D6A4F`, sun gold `#FFC857`, firefly `#AAFF00` |
| Mid layer | Dense green canopy silhouette, sunbeams through leaves |
| Left/right edge | Broad leafy trees, hanging vines, occasional glow spots |
| Ground | Rich green grass, blue/green glowing mushrooms, small pond shimmer (corner) |
| Particles | Fireflies (10–15), golden dust motes; optional 1–2 tiny birds (static SVG with bob animation) |
| Light effect | Dappled sunlight patches, slow pulse |
| Switcher icon | ☀️ Sun / leaf |

### 4.3 Autumn (Thu)

| Property | Value |
|----------|-------|
| Mood | Cozy, golden, storybook harvest |
| Sky gradient | `#FFECD2` → `#FCB69F` → `#C9A66B` |
| Accent colors | Amber `#E67E22`, rust `#C0392B`, warm brown `#8B4513` |
| Mid layer | Orange/red tree line, soft fog at ground level |
| Left/right edge | Maple/oak trees with orange foliage, red toadstools, small pumpkins |
| Ground | Fallen leaves pile at corners, acorns, mossy stones |
| Particles | Falling leaves (10–12), varied orange/red/yellow; occasional leaf swirl |
| Light effect | Golden hour glow from right, long soft shadows |
| Switcher icon | 🍂 Maple leaf |

### 4.4 Winter (Đông)

| Property | Value |
|----------|-------|
| Mood | Quiet, enchanted, soft snow kingdom |
| Sky gradient | `#1a2744` → `#4a6fa5` → `#c9d6e8` (twilight feel) |
| Accent colors | Ice blue `#A8D8EA`, snow white `#F8FAFC`, warm lantern `#FFB347` |
| Mid layer | Snow-covered pines, distant frozen castle, faint aurora band (optional, very subtle) |
| Left/right edge | Snow-laden branches, icicles, warm lantern posts |
| Ground | Snow drifts, frosted mushrooms, small gift-like stones (subtle fairy tale) |
| Particles | Snowflakes (15–20), varied size/speed; occasional ice sparkle |
| Light effect | Cool blue ambient + warm lantern glow at bottom corners |
| Switcher icon | ❄️ Snowflake |

---

## 5. Decorative Object Catalog

Reusable object types (implemented once, themed via CSS variables / SVG fill):

| Object ID | Placement | Animation | Notes |
|-----------|-----------|-----------|-------|
| `tree-left` | Left edge, 20–40% from top | Slight sway (3s ease) | Mirror for `tree-right` |
| `tree-right` | Right edge | Slight sway, phase offset | Taller variant optional |
| `vines-top` | Top corners | None or slow wave | Frame the sky |
| `mushroom-cluster` | Bottom left/right | Glow pulse (firefly sync) | Theme-colored caps |
| `grass-tufts` | Bottom edge | None | Tiled SVG |
| `lantern` | Winter/autumn corners | Flicker glow | Skip in spring/summer or dimmed |
| `castle-far` | Center-back, sky layer | None, 10% opacity | Shared asset, tint per season |
| `mist-layer` | Ground level | Horizontal drift 20s | All seasons, color varies |
| `particles` | Full screen, behind safe zone | Fall/drift loops | See season table |

**Asset strategy (recommended):**

- Phase 1: CSS gradients + inline SVG components (no external image files initially)
- Phase 2: Optional PNG/WebP illustrations for trees/mushrooms if art assets are provided
- All SVGs use `currentColor` or CSS custom properties for season tinting

---

## 6. Theme Switcher UI

### 6.1 Behavior

- Four buttons: **Xuân | Hạ | Thu | Đông**
- Click → crossfade background (~600ms), swap particles and edge objects
- Persist choice in `localStorage` key: `wewin_forest_theme` (`spring` | `summer` | `autumn` | `winter`)
- Default on first visit: `spring`
- No page reload required

### 6.2 Desktop placement

- Top-right of main content area, below or beside breadcrumb row
- Pill container: `bg-white/70 backdrop-blur-md rounded-full border border-white/50 shadow-md`
- Each season: circular button 36px, icon + tooltip on hover (`title` attribute)
- Active season: ring highlight matching season accent color

### 6.3 Mobile placement

- Compact row inside `GameMobileToolbar` area OR floating bottom-left above progress pill
- 4 small icons only (28px), no text labels
- Must not overlap carousel swipe zones

### 6.4 Accessibility

- `aria-label`: "Chọn theme Xuân", etc.
- `role="radiogroup"` with `aria-checked` on active button
- Respect `prefers-reduced-motion`: disable particle animations and parallax; keep static gradient + silhouettes

---

## 7. Architecture

### 7.1 New components

```
frontend/app/components/games/forest-background/
├── FantasyForestBackground.tsx   # Main wrapper, reads theme, renders layers
├── ForestSkyLayer.tsx            # Gradient + distant castle
├── ForestEdgeDecor.tsx           # Trees, vines, ground objects
├── ForestParticles.tsx           # Seasonal particle system (CSS/SVG)
├── SeasonThemeSwitcher.tsx         # 4-button UI control
├── themes.ts                     # Theme config (colors, object visibility, particle defs)
└── useForestTheme.ts             # Hook: state + localStorage sync
```

### 7.2 Integration points

| File | Change |
|------|--------|
| `frontend/app/games/starters/[slug]/[part]/page.tsx` | Wrap `UnitGameScreen` with `FantasyForestBackground` |
| Same pattern for kids/movers/flyers part pages | Shared wrapper |
| `UnitGameScreen.tsx` | Optional: pass `showThemeSwitcher` prop; or switcher lives inside background wrapper |
| `GameMenu.tsx` | No structural change; remains `bg-transparent` |

**Wrapper pattern:**

```tsx
<div className="relative min-h-screen">
  <FantasyForestBackground theme={theme} onThemeChange={setTheme} />
  <div className="relative z-10">
    <StarterUnitsSidebar ... />
    <UnitGameScreen ... />
  </div>
  <SeasonThemeSwitcher ... /> {/* fixed position, z-20 */}
</div>
```

### 7.3 Data flow

```
User clicks season button
  → useForestTheme.setTheme('autumn')
  → localStorage.setItem('wewin_forest_theme', 'autumn')
  → FantasyForestBackground re-renders layers with autumn config
  → CSS transition on gradient opacity / particle keyframes swap
```

No backend or API required.

---

## 8. Animation Guidelines

| Effect | Duration | Easing | Reduced motion |
|--------|----------|--------|----------------|
| Theme crossfade | 600ms | ease-in-out | Instant swap |
| Tree sway | 3–4s | ease-in-out, infinite | Static |
| Petals/leaves/snow | 8–15s fall loop | linear | Hidden |
| Fireflies | 2–5s opacity + translate | ease-in-out | Hidden |
| Mist drift | 20s | linear, infinite | Static opacity |
| Lantern flicker | 1.5s | steps(3) | Static glow |

**Performance rules:**

- Max 20 animated DOM nodes for particles (use CSS `@keyframes` on pseudo-elements where possible)
- No canvas/WebGL in phase 1
- `will-change: transform` only on actively animating elements
- Background component lazy-loaded if bundle size is a concern

---

## 9. Visual Balance Rules

1. Background saturation ≤ 70% of game card saturation
2. No decorative element above 40% opacity in the safe zone
3. Sidebar (`StarterUnitsSidebar` etc.) sits above background; background extends full viewport behind sidebar on desktop
4. Breadcrumb and back button remain on white/glass pills for readability
5. Unit title (`#0E4BA9`) remains unchanged; background must not reduce contrast

---

## 10. Phase Plan

### Phase 1 (MVP)
- `FantasyForestBackground` with CSS gradient sky per season
- Edge tree SVG silhouettes (left/right)
- Particle system (CSS-only)
- Theme switcher + localStorage
- Integrate on Starters `[slug]/[part]` page only

### Phase 2
- Roll out to Kids, Movers, Flyers pages
- Richer SVG ground objects (mushrooms, lanterns)
- Subtle mouse parallax on desktop (max 8px shift)

### Phase 3 (optional)
- Custom illustrated assets from design team
- Sound ambient toggle (birds, wind, snow — off by default)
- Admin setting for default season per deployment

---

## 11. Testing Checklist

- [ ] Theme persists after page refresh
- [ ] Theme switch does not reset carousel index or game state
- [ ] Safe zone: no decor overlaps game cards at 1280px, 768px, 375px widths
- [ ] Sidebar + background render correctly together
- [ ] `prefers-reduced-motion`: static fallback renders
- [ ] Lighthouse: no significant CLS from background mount
- [ ] Mobile: switcher reachable, carousel still swipeable

---

## 12. Open Questions (resolved)

| Question | Decision |
|----------|----------|
| Theme switching method | Manual switcher (4 buttons) |
| Visual style | Soft Storybook + seasonal variation |
| Default theme | Spring |
| Scope phase 1 | Menu view on game part pages |

---

## 13. Approval

- [x] User approved concept direction (Soft Storybook + seasonal themes + manual switcher)
- [ ] User reviewed this spec document
- [ ] Ready for implementation plan (`writing-plans` skill)
