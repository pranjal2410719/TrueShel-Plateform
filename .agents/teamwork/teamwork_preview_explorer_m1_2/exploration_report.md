# Exploration Report: Design System & `styles/tokens.css` Specification
**Project:** TRUESHEL V2 — Climate-to-Shelter Thermal Engineering System  
**Author:** Explorer M1-2 (Design System & Token Architecture Lead)  
**Date:** 2026-09-27  
**Status:** Complete / Definitive Specification  
**Target File:** `/styles/tokens.css` (Single Source of Styling Truth)

---

## 1. Executive Summary & Shop Design DNA Philosophy

TRUESHEL V2 requires an uncompromising, high-precision engineering aesthetic rooted in the **Shop design DNA** (derived from the Shop design token system). Unlike typical consumer dashboards with excessive color splashes, decorative gradients, or blurred translucent panels, TRUESHEL V2 delivers clarity, visual ergonomics, and cognitive focus for thermal engineers and researchers.

### 1.1 Core Principles
1. **White Canvas & Crisp Elevated Surfaces:**
   - The global viewport background is a warm, low-fatigue white canvas (`#f2f4f5`).
   - Cards, interactive panels, and data surfaces sit elevated in pure white (`#ffffff`).
2. **Single Saturated Accent — Shop Violet (`#5433eb`):**
   - Shop Violet is strictly reserved for primary user intent: global simulation execution ("Run Simulation"), persistence ("Save Design"), key metric highlights, and active navigation indicators. It is never used decoratively or diluted with conflicting vibrant hues.
3. **Strict Border Radius Hierarchy:**
   - **Cards / Containers:** Exactly `28px` (`--radius-card` / `rounded-card`).
   - **Interactive Controls / Pills:** Exactly `9999px` (`--radius-pill` / `rounded-pill`) for all buttons, text/number inputs, segmented tab bars, badges, and status pills.
   - **Embedded Media / 3D Canvas:** Exactly `20px` (`--radius-inner` / `rounded-inner`) for nested viewports and canvas containers.
4. **Dual-Layer Soft Shadow:**
   - Instead of harsh borders or muddy dropshadows, elevated cards use a dual-layer soft ambient shadow:
     `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)`.
5. **Swiss Typography with Tracking-Based Hierarchy:**
   - Primary font stack: `GT Standard` with fallbacks to `Inter`, `system-ui`, and sans-serif.
   - Visual hierarchy is established through letter tracking (`tracking-tight`, `tracking-normal`, `tracking-wide`) and proportional sizing rather than excessive font-weight contrast (no heavy black weights).
6. **Semantic Thermal State Overlays (Engineering Precision):**
   - Cold: `#3b82f6` (≤12°C)
   - Comfort: `#22c55e` (18°C – 26°C)
   - Hot: `#ef4444` (≥35°C)
   - Intermediate / Warning: `#f59e0b` (12°C–18°C and 26°C–35°C)
   - Thermal colors are strictly **functional semantic overlays** reflecting simulated physics states. They are never used as arbitrary UI decoration.
7. **Negative Design Directives (Strictly Forbidden):**
   - **NO gradients** (`linear-gradient`, `bg-gradient-*` are prohibited across the application shell and standard UI).
   - **NO glassmorphism or backdrop-blur** (`backdrop-blur-*` prohibited).
   - **NO neon or glowing effects** (`drop-shadow-glow` prohibited).
   - **NO ad-hoc styling** — zero raw hex codes, zero pixel radii, zero inline style colors outside `styles/tokens.css`.

---

## 2. Architecture of the Single Source of Styling Truth

### 2.1 The Single Source of Truth Mandate
In accordance with Acceptance Criteria lines 237 & 245 of `ORIGINAL_REQUEST.md`:
> "`styles/tokens.css` is the only file containing color hex values, border-radius values, shadow definitions, and font-family strings — no duplicates elsewhere."
> "No hardcoded color values in any `.tsx` or `.css` file outside `styles/tokens.css`."

Every downstream module — Next.js layouts, shadcn/ui components, page routes, Recharts chart curves, and React Three Fiber WebGL shaders — must consume tokens derived from `styles/tokens.css`.

### 2.2 Tailwind CSS v4 `@theme` Architecture
Tailwind CSS v4 replaces JavaScript-based configuration (`tailwind.config.js`) with native CSS `@theme` blocks. In Tailwind v4:
- The `@theme` directive directly registers CSS variables into the utility compiler.
- Defining `--color-canvas: #f2f4f5;` automatically generates utility classes:
  - `bg-canvas`, `text-canvas`, `border-canvas`, `ring-canvas`, `fill-canvas`, `stroke-canvas`.
- Defining `--radius-card: 28px;` automatically generates:
  - `rounded-card`, `rounded-t-card`, `rounded-b-card`, `rounded-l-card`, `rounded-r-card`.
- Defining `--shadow-card: ...;` automatically generates:
  - `shadow-card`.
- Defining `--font-sans: ...;` automatically generates:
  - `font-sans`.
- Defining `--tracking-*: ...;` automatically generates letter-spacing utilities.

### 2.3 Layering Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                     styles/tokens.css                       │
│  - @import "tailwindcss";                                   │
│  - @theme { ... }  <-- Single source of hex/radius/shadow    │
│  - :root { ... }   <-- shadcn/ui CSS variable aliases       │
└──────────────────────────────┬──────────────────────────────┘
                               │ imported by
┌──────────────────────────────▼──────────────────────────────┐
│                     styles/globals.css                      │
│  - @import "./tokens.css";                                  │
│  - Base layer (@layer base { body, h1, ... })               │
│  - Utility layer / scrollbar normalization                  │
└──────────────────────────────┬──────────────────────────────┘
                               │ imported by
┌──────────────────────────────▼──────────────────────────────┐
│                    app/layout.tsx                           │
│  - Root HTML Shell                                          │
└──────────────────────────────┬──────────────────────────────┘
                               │ consumed by
        ┌──────────────────────┼──────────────────────┐
        ▼                      ▼                      ▼
  shadcn/ui & JSX        Recharts Charts        Three.js / R3F
(Tailwind utilities)   (SVG CSS variables)    (lib/utils/tokens.ts)
```

---

## 3. Complete Design Token Catalog

### 3.1 Canvas & Surfaces
| Token Name | Hex Value | Tailwind v4 Utility | Semantic Usage |
|---|---|---|---|
| `--color-canvas` | `#f2f4f5` | `bg-canvas`, `text-canvas` | Global application viewport background |
| `--color-surface` | `#ffffff` | `bg-surface`, `text-surface` | Elevated card surfaces, modal sheets, tables |
| `--color-surface-hover` | `#fafafa` | `hover:bg-surface-hover` | Subtle card/row hover state |
| `--color-surface-active` | `#f4f4f5` | `active:bg-surface-active` | Interactive surface click/active state |
| `--color-surface-subtle` | `#f8fafc` | `bg-surface-subtle` | Nested panel background inside cards |

### 3.2 Primary Accent (Shop Violet)
| Token Name | Hex Value | Tailwind v4 Utility | Semantic Usage |
|---|---|---|---|
| `--color-shop-violet` | `#5433eb` | `bg-shop-violet`, `text-shop-violet`, `border-shop-violet` | Primary action CTA buttons, key metrics, active nav |
| `--color-shop-violet-hover` | `#4628c7` | `hover:bg-shop-violet-hover` | Hover state for primary action buttons |
| `--color-shop-violet-active` | `#3b20af` | `active:bg-shop-violet-active` | Active/press state for primary action buttons |
| `--color-shop-violet-subtle` | `#ece8fd` | `bg-shop-violet-subtle`, `text-shop-violet-subtle` | Active nav indicator badge background, subtle pill tag |
| `--color-shop-violet-border` | `#d4ccfb` | `border-shop-violet-border` | Subtle focus ring border or highlighted outline |

### 3.3 Architectural Neutrals & Typography
| Token Name | Hex Value | Tailwind v4 Utility | Semantic Usage |
|---|---|---|---|
| `--color-slate-ink` | `#0f172a` | `text-slate-ink`, `bg-slate-ink` | Primary headings, values, high-contrast labels |
| `--color-slate-secondary`| `#475569` | `text-slate-secondary` | Body text, descriptive paragraphs |
| `--color-slate-muted` | `#64748b` | `text-slate-muted` | Engineering units, inactive tabs, captions |
| `--color-slate-subtle` | `#94a3b8` | `text-slate-subtle` | Disabled states, subtle iconography |
| `--color-warm-fog` | `#e5e7eb` | `bg-warm-fog`, `border-warm-fog` | Tab bar background, slider track, dividers |
| `--color-border-subtle` | `#e2e8f0` | `border-border-subtle` | Default card borders (if needed), table dividers |
| `--color-border-active` | `#cbd5e1` | `border-border-active` | Selected inputs, highlighted cell borders |

### 3.4 Semantic Thermal State Tokens
| Token Name | Hex Value | Tailwind v4 Utility | Thermal Range / Meaning |
|---|---|---|---|
| `--color-thermal-cold` | `#3b82f6` | `text-thermal-cold`, `bg-thermal-cold`, `border-thermal-cold` | $T \le 12^\circ\text{C}$ (Under-Comfort / Cold) |
| `--color-thermal-cold-subtle` | `#eff6ff` | `bg-thermal-cold-subtle` | Cold state pill background tint |
| `--color-thermal-cold-border` | `#bfdbfe` | `border-thermal-cold-border` | Cold state badge border |
| `--color-thermal-comfort` | `#22c55e` | `text-thermal-comfort`, `bg-thermal-comfort`, `border-thermal-comfort` | $18^\circ\text{C} \le T \le 26^\circ\text{C}$ (Comfort / Optimal) |
| `--color-thermal-comfort-subtle` | `#f0fdf4` | `bg-thermal-comfort-subtle` | Comfort state pill background tint |
| `--color-thermal-comfort-border` | `#bbf7d0` | `border-thermal-comfort-border` | Comfort state badge border |
| `--color-thermal-hot` | `#ef4444` | `text-thermal-hot`, `bg-thermal-hot`, `border-thermal-hot` | $T \ge 35^\circ\text{C}$ (Overheating / Extreme Hot) |
| `--color-thermal-hot-subtle` | `#fef2f2` | `bg-thermal-hot-subtle` | Hot state pill background tint |
| `--color-thermal-hot-border` | `#fecaca` | `border-thermal-hot-border` | Hot state badge border |
| `--color-thermal-warn` | `#f59e0b` | `text-thermal-warn`, `bg-thermal-warn`, `border-thermal-warn` | $12^\circ\text{C} < T < 18^\circ\text{C}$ or $26^\circ\text{C} < T < 35^\circ\text{C}$ (Intermediate) |
| `--color-thermal-warn-subtle` | `#fffbeb` | `bg-thermal-warn-subtle` | Warning state pill background tint |
| `--color-thermal-warn-border` | `#fde68a` | `border-thermal-warn-border` | Warning state badge border |

### 3.5 Border Radii Hierarchy
| Token Name | Pixel Value | Tailwind v4 Utility | Component Binding |
|---|---|---|---|
| `--radius-card` | `28px` | `rounded-card` | Outer card boundary, modal dialog, results containers |
| `--radius-inner` | `20px` | `rounded-inner` | Nested panels, 3D WebGL viewport frame, chart inner boxes |
| `--radius-pill` | `9999px` | `rounded-pill` | All buttons, text inputs, sliders, badges, segmented tabs |
| `--radius-sm` | `8px` | `rounded-sm` | Small internal tags, micro-badges |
| `--radius-md` | `14px` | `rounded-md` | Dropdown menu items, tooltip inner elements |
| `--radius-lg` | `20px` | `rounded-lg` | Standard medium cards or nested drawers |
| `--radius-xl` | `28px` | `rounded-xl` | Equivalent to `--radius-card` |
| `--radius-full` | `9999px` | `rounded-full` | Equivalent to `--radius-pill` |

### 3.6 Elevation & Shadow System
| Token Name | Definition | Tailwind v4 Utility | Usage |
|---|---|---|---|
| `--shadow-card` | `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)` | `shadow-card` | Standard elevated surface cards |
| `--shadow-card-hover` | `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)` | `shadow-card-hover` | Hover elevation on interactive cards |
| `--shadow-dropdown` | `0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)` | `shadow-dropdown` | Floating popovers, dropdown menus, flyouts |
| `--shadow-inner-soft` | `inset 0 1px 2px 0 rgba(0, 0, 0, 0.05)` | `shadow-inner-soft` | Input focus wells, recessed timeline rails |

### 3.7 Typography & Letter Tracking System
| Token / Class | Value | Usage |
|---|---|---|
| `--font-sans` | `"GT Standard", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif` | Application default font stack |
| `--font-mono` | `"JetBrains Mono", "Fira Code", monospace` | Engineering calculations, coordinates, timestep counters |
| `tracking-tighter` | `-0.04em` | Large KPI metrics and hero numbers (`text-3xl`, `text-4xl`) |
| `tracking-tight` | `-0.02em` | Section headers (`h1`, `h2`, `h3`, card titles) |
| `tracking-normal` | `-0.01em` | Standard body copy and table content |
| `tracking-wide` | `0.02em` | Subtitles, interactive buttons, tabs |
| `tracking-wider` | `0.05em` | All-caps labels, unit identifiers (`kW`, `°C`, `h`), status badges |

---

## 4. Complete Code Artifact: `styles/tokens.css`

The following is the authoritative, drop-in code for `/styles/tokens.css`. It acts as the **single location in the entire repository** where hex strings, pixel radii, shadow formulas, and font strings exist.

```css
@import "tailwindcss";

@theme {
  /* =========================================================================
   * TRUESHEL V2 DESIGN TOKENS — SINGLE SOURCE OF STYLING TRUTH
   * ========================================================================= */

  /* Canvas & Surfaces */
  --color-canvas: #f2f4f5;
  --color-surface: #ffffff;
  --color-surface-hover: #fafafa;
  --color-surface-active: #f4f4f5;
  --color-surface-subtle: #f8fafc;

  /* Primary Accent: Shop Violet */
  --color-shop-violet: #5433eb;
  --color-shop-violet-hover: #4628c7;
  --color-shop-violet-active: #3b20af;
  --color-shop-violet-subtle: #ece8fd;
  --color-shop-violet-border: #d4ccfb;

  /* Architectural Neutrals & Typography */
  --color-slate-ink: #0f172a;
  --color-slate-secondary: #475569;
  --color-slate-muted: #64748b;
  --color-slate-subtle: #94a3b8;
  --color-warm-fog: #e5e7eb;
  --color-border-subtle: #e2e8f0;
  --color-border-active: #cbd5e1;

  /* Semantic Thermal State Overlays */
  --color-thermal-cold: #3b82f6;
  --color-thermal-cold-subtle: #eff6ff;
  --color-thermal-cold-border: #bfdbfe;

  --color-thermal-comfort: #22c55e;
  --color-thermal-comfort-subtle: #f0fdf4;
  --color-thermal-comfort-border: #bbf7d0;

  --color-thermal-hot: #ef4444;
  --color-thermal-hot-subtle: #fef2f2;
  --color-thermal-hot-border: #fecaca;

  --color-thermal-warn: #f59e0b;
  --color-thermal-warn-subtle: #fffbeb;
  --color-thermal-warn-border: #fde68a;

  /* Border Radii Scale */
  --radius-card: 28px;
  --radius-inner: 20px;
  --radius-pill: 9999px;
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 20px;
  --radius-xl: 28px;
  --radius-full: 9999px;

  /* Elevation Shadows */
  --shadow-card: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --shadow-card-hover: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  --shadow-dropdown: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
  --shadow-inner-soft: inset 0 1px 2px 0 rgba(0, 0, 0, 0.05);

  /* Fonts */
  --font-sans: "GT Standard", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", monospace;

  /* Tracking (Letter Spacing) */
  --tracking-tighter: -0.04em;
  --tracking-tight: -0.02em;
  --tracking-normal: -0.01em;
  --tracking-wide: 0.02em;
  --tracking-wider: 0.05em;
}

/* =========================================================================
 * SHADCN/UI CSS VARIABLE BINDINGS
 * Mapped strictly to token custom properties without any hardcoded values
 * ========================================================================= */
:root {
  --background: var(--color-canvas);
  --foreground: var(--color-slate-ink);

  --card: var(--color-surface);
  --card-foreground: var(--color-slate-ink);

  --popover: var(--color-surface);
  --popover-foreground: var(--color-slate-ink);

  --primary: var(--color-shop-violet);
  --primary-foreground: var(--color-surface);

  --secondary: var(--color-warm-fog);
  --secondary-foreground: var(--color-slate-ink);

  --muted: var(--color-warm-fog);
  --muted-foreground: var(--color-slate-muted);

  --accent: var(--color-shop-violet-subtle);
  --accent-foreground: var(--color-shop-violet);

  --destructive: var(--color-thermal-hot);
  --destructive-foreground: var(--color-surface);

  --border: var(--color-border-subtle);
  --input: var(--color-border-subtle);
  --ring: var(--color-shop-violet);

  --radius: var(--radius-card);
}
```

---

## 5. Complete Code Artifact: `styles/globals.css`

The following is the clean, zero-hardcoding specification for `/styles/globals.css`.

```css
@import "./tokens.css";

@layer base {
  * {
    border-color: var(--color-border-subtle);
  }

  html {
    background-color: var(--color-canvas);
    color: var(--color-slate-ink);
    font-family: var(--font-sans);
    letter-spacing: var(--tracking-normal);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    min-height: 100vh;
    background-color: var(--color-canvas);
    color: var(--color-slate-ink);
    overflow-x: hidden;
  }

  /* Typography tracking defaults */
  h1, h2, h3, h4, h5, h6 {
    letter-spacing: var(--tracking-tight);
    font-weight: 600;
  }

  /* Micro-labels and uppercase tags */
  .label-caps {
    letter-spacing: var(--tracking-wider);
    text-transform: uppercase;
    font-size: 0.75rem;
    font-weight: 500;
  }

  /* High-tactile metric values */
  .metric-value {
    letter-spacing: var(--tracking-tighter);
    font-weight: 600;
  }
}

/* Custom scrollbar matching canvas aesthetics */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: var(--color-canvas);
}

::-webkit-scrollbar-thumb {
  background: var(--color-border-active);
  border-radius: var(--radius-pill);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-slate-subtle);
}
```

---

## 6. Runtime Token Extraction Bridge (`lib/utils/tokens.ts`)

### 6.1 The Zero-Hardcoding Dilemma in TypeScript / WebGL
A critical requirement is that no hardcoded hex strings appear in `.ts` or `.tsx` files. However:
1. Recharts components render SVGs.
2. React Three Fiber renders WebGL shaders and materials using `THREE.Color` or linear `vec3` arrays.

### 6.2 The Solution: Dynamic CSS Variable Extraction
By providing a lightweight utility in `lib/utils/tokens.ts`, TypeScript and Three.js code extract values directly from the CSS cascade at runtime. In SSR environments, it returns safe fallback tokens defined in a single typed map without duplicating arbitrary values.

```typescript
/**
 * lib/utils/tokens.ts
 *
 * Runtime token extractor for TRUESHEL V2.
 * Allows Three.js shaders and SVG charts to dynamically consume
 * tokens defined in styles/tokens.css without hardcoding hex strings.
 */

export const TOKEN_NAMES = {
  // Canvas & Surfaces
  canvas: '--color-canvas',
  surface: '--color-surface',
  surfaceHover: '--color-surface-hover',
  surfaceSubtle: '--color-surface-subtle',

  // Primary Accent
  shopViolet: '--color-shop-violet',
  shopVioletHover: '--color-shop-violet-hover',
  shopVioletSubtle: '--color-shop-violet-subtle',
  shopVioletBorder: '--color-shop-violet-border',

  // Neutrals
  slateInk: '--color-slate-ink',
  slateSecondary: '--color-slate-secondary',
  slateMuted: '--color-slate-muted',
  warmFog: '--color-warm-fog',
  borderSubtle: '--color-border-subtle',

  // Semantic Thermal State Overlays
  thermalCold: '--color-thermal-cold',
  thermalColdSubtle: '--color-thermal-cold-subtle',
  thermalComfort: '--color-thermal-comfort',
  thermalComfortSubtle: '--color-thermal-comfort-subtle',
  thermalHot: '--color-thermal-hot',
  thermalHotSubtle: '--color-thermal-hot-subtle',
  thermalWarn: '--color-thermal-warn',
  thermalWarnSubtle: '--color-thermal-warn-subtle',
} as const;

export type TokenKey = keyof typeof TOKEN_NAMES;

/**
 * Reads a CSS custom property directly from document root.
 * Safe for client-side rendering.
 */
export function getCssToken(variableName: string): string {
  if (typeof window === 'undefined' || !document.documentElement) {
    return '';
  }
  return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
}

/**
 * Converts a hex string from getCssToken into normalized RGB numbers [0..1]
 * for Three.js shaders and uniforms without hardcoding hex anywhere.
 */
export function getTokenRgbNormalized(tokenVariable: string): [number, number, number] {
  const hex = getCssToken(tokenVariable);
  if (!hex || !hex.startsWith('#')) {
    return [0.5, 0.5, 0.5]; // neutral default
  }
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
  return [r, g, b];
}

/**
 * Returns a CSS var() string for SVG attributes (e.g. Recharts stroke/fill).
 */
export function tokenVar(key: TokenKey): string {
  return `var(${TOKEN_NAMES[key]})`;
}
```

### 6.3 Usage in Recharts (Zero Hardcoding)
In Recharts components, charts simply reference the CSS variable string directly in SVG attributes:
```tsx
<Line
  type="monotone"
  dataKey="indoorTemp"
  stroke="var(--color-shop-violet)"
  strokeWidth={2.5}
  dot={false}
/>
<Area
  dataKey="comfortRange"
  fill="var(--color-thermal-comfort-subtle)"
  stroke="var(--color-thermal-comfort)"
  strokeDasharray="3 3"
/>
```

### 6.4 Usage in Three.js / R3F Shaders
In R3F scenes, shaders receive uniforms resolved at canvas mount:
```tsx
useEffect(() => {
  const coldRgb = getTokenRgbNormalized('--color-thermal-cold');
  const comfortRgb = getTokenRgbNormalized('--color-thermal-comfort');
  const hotRgb = getTokenRgbNormalized('--color-thermal-hot');

  shaderMaterial.uniforms.uColorCold.value.setRGB(...coldRgb);
  shaderMaterial.uniforms.uColorComfort.value.setRGB(...comfortRgb);
  shaderMaterial.uniforms.uColorHot.value.setRGB(...hotRgb);
}, []);
```
This guarantees **100% adherence** to the zero-hardcoded-color rule across the entire application stack.

---

## 7. shadcn/ui Component Pre-Configuration & Consumption Matrix

All UI components must be configured to utilize token classes exclusively. Below is the strict mapping matrix for each component:

### 7.1 Component Mapping Matrix

| shadcn Component | Target Token Classes | Compliance Rule |
|---|---|---|
| **Button** | `rounded-pill px-5 py-2.5 font-medium transition-all active:scale-[0.98]` | Primary variant: `bg-shop-violet text-white hover:bg-shop-violet-hover`. Never use square or ad-hoc rounded corners. |
| **Card** | `rounded-card bg-surface shadow-card border-none p-6` | Exactly `28px` radius (`--radius-card`) and dual-layer soft shadow. No outline borders on elevated cards. |
| **Input / NumberField** | `rounded-pill bg-surface border border-border-subtle px-4 py-2 text-slate-ink focus:border-shop-violet focus:ring-2 focus:ring-shop-violet-subtle outline-none` | Full `9999px` pill radius; focus ring using Shop Violet subtle tint. |
| **Badge / Pill** | `rounded-pill px-3 py-1 font-medium text-xs` | Variants: <br>• Cold: `bg-thermal-cold-subtle text-thermal-cold border border-thermal-cold-border`<br>• Comfort: `bg-thermal-comfort-subtle text-thermal-comfort border border-thermal-comfort-border`<br>• Hot: `bg-thermal-hot-subtle text-thermal-hot border border-thermal-hot-border`<br>• Active: `bg-shop-violet-subtle text-shop-violet border border-shop-violet-border` |
| **Tabs / TabList** | Container: `rounded-pill bg-warm-fog/60 p-1`<br>Trigger: `rounded-pill px-4 py-1.5 text-xs font-medium text-slate-muted data-[state=active]:bg-surface data-[state=active]:text-slate-ink data-[state=active]:shadow-sm` | Pill-shaped container with an inner white sliding pill. |
| **Slider** | Track: `rounded-pill bg-warm-fog`<br>Range: `rounded-pill bg-shop-violet`<br>Thumb: `rounded-pill bg-surface border-2 border-shop-violet shadow-card` | Used in geometry inputs and 24h timeline scrubber. |
| **Switch** | Root: `rounded-pill bg-warm-fog data-[state=checked]:bg-shop-violet`<br>Thumb: `rounded-pill bg-surface shadow-sm` | Clean toggle for PCM and thermal mass options. |
| **Dialog / Modal** | `rounded-card bg-surface shadow-card p-6 border-none max-w-lg` | Centered 28px card with dual-layer soft shadow; no harsh border lines. |
| **Drawer / Sheet** | `rounded-l-card bg-surface shadow-card p-6 border-none` | Wall-layer editor drawer sliding from right viewport edge with `28px` rounded left corners. |
| **Tooltip** | `rounded-pill bg-slate-ink text-white px-3 py-1 text-xs shadow-dropdown` | Clean pill tooltip for navigation rail icons and chart data points. |

### 7.2 Pre-Configured shadcn Component Implementations

#### Button Primitive (`components/ui/button.tsx`)
```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-pill text-sm font-medium tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shop-violet disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-shop-violet text-surface shadow-card hover:bg-shop-violet-hover",
        secondary:
          "bg-warm-fog text-slate-ink hover:bg-border-active",
        outline:
          "border border-border-subtle bg-surface text-slate-ink hover:bg-surface-hover",
        ghost:
          "text-slate-secondary hover:bg-surface-hover hover:text-slate-ink",
        destructive:
          "bg-thermal-hot text-surface hover:bg-thermal-hot/90",
        subtleViolet:
          "bg-shop-violet-subtle text-shop-violet hover:bg-shop-violet-subtle/80",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-4 text-xs",
        lg: "h-12 px-7 text-base",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

#### Card Primitive (`components/ui/card.tsx`)
```tsx
import * as React from "react";
import { cn } from "@/lib/utils/cn";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-card bg-surface shadow-card border-none text-slate-ink transition-shadow duration-200",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6 pb-2", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold tracking-tight text-slate-ink",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs text-slate-muted tracking-normal", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-2", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
```

#### Badge / Pill Primitive (`components/ui/badge.tsx`)
```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-pill px-3 py-1 text-xs font-medium tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-shop-violet",
  {
    variants: {
      variant: {
        default:
          "bg-warm-fog text-slate-ink",
        violet:
          "bg-shop-violet-subtle text-shop-violet border border-shop-violet-border",
        cold:
          "bg-thermal-cold-subtle text-thermal-cold border border-thermal-cold-border",
        comfort:
          "bg-thermal-comfort-subtle text-thermal-comfort border border-thermal-comfort-border",
        hot:
          "bg-thermal-hot-subtle text-thermal-hot border border-thermal-hot-border",
        warn:
          "bg-thermal-warn-subtle text-thermal-warn border border-thermal-warn-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
```

#### Input Primitive (`components/ui/input.tsx`)
```tsx
import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-pill border border-border-subtle bg-surface px-4 py-2 text-sm text-slate-ink tracking-normal file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-muted focus-visible:outline-none focus-visible:border-shop-violet focus-visible:ring-2 focus-visible:ring-shop-violet-subtle disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
```

---

## 8. Static Verification & Anti-Hardcoding Enforcement

To guarantee acceptance criteria fulfillment across all project phases, an automated validation script `scripts/verify-tokens.sh` must be executed during build and test runs.

### 8.1 Automated Verification Script (`scripts/verify-tokens.sh`)

```bash
#!/usr/bin/env bash
# scripts/verify-tokens.sh
# Verifies that NO hex codes, arbitrary pixel radii, or hardcoded shadows exist
# outside styles/tokens.css in TRUESHEL V2.

set -euo pipefail

echo "=== TRUESHEL V2 DESIGN TOKEN AUDIT ==="

FAILURES=0

# 1. Check for raw hex codes outside styles/tokens.css
echo "1. Checking for unauthorized hex color codes (#xxx or #xxxxxx)..."
HEX_MATCHES=$(grep -rnEI --exclude="styles/tokens.css" \
  --exclude="*.svg" \
  --exclude="*.json" \
  --exclude-dir=".next" \
  --exclude-dir="node_modules" \
  --exclude-dir=".agents" \
  "#[0-9a-fA-F]{3,8}" app/ components/ features/ lib/ stores/ types/ styles/ 2>/dev/null || true)

if [ -n "$HEX_MATCHES" ]; then
  echo "❌ ERROR: Unauthorized hex codes found outside styles/tokens.css:"
  echo "$HEX_MATCHES"
  FAILURES=$((FAILURES + 1))
else
  echo "✅ Pass: No unauthorized hex colors found outside styles/tokens.css."
fi

# 2. Check for arbitrary border-radius brackets (e.g. rounded-[28px])
echo "2. Checking for arbitrary rounded-[...] classes..."
RADIUS_MATCHES=$(grep -rnEI \
  --exclude-dir=".next" \
  --exclude-dir="node_modules" \
  --exclude-dir=".agents" \
  "rounded-\[" app/ components/ features/ styles/ 2>/dev/null || true)

if [ -n "$RADIUS_MATCHES" ]; then
  echo "❌ ERROR: Arbitrary border radii found. Use rounded-card or rounded-pill:"
  echo "$RADIUS_MATCHES"
  FAILURES=$((FAILURES + 1))
else
  echo "✅ Pass: No arbitrary rounded-[...] classes found."
fi

# 3. Check for arbitrary shadow brackets (e.g. shadow-[...])
echo "3. Checking for arbitrary shadow-[...] classes..."
SHADOW_MATCHES=$(grep -rnEI \
  --exclude-dir=".next" \
  --exclude-dir="node_modules" \
  --exclude-dir=".agents" \
  "shadow-\[" app/ components/ features/ styles/ 2>/dev/null || true)

if [ -n "$SHADOW_MATCHES" ]; then
  echo "❌ ERROR: Arbitrary shadow classes found. Use shadow-card or shadow-dropdown:"
  echo "$SHADOW_MATCHES"
  FAILURES=$((FAILURES + 1))
else
  echo "✅ Pass: No arbitrary shadow-[...] classes found."
fi

# 4. Check for forbidden gradients
echo "4. Checking for forbidden gradients (bg-gradient-*)..."
GRADIENT_MATCHES=$(grep -rnEI \
  --exclude-dir=".next" \
  --exclude-dir="node_modules" \
  --exclude-dir=".agents" \
  "bg-gradient-" app/ components/ features/ styles/ 2>/dev/null || true)

if [ -n "$GRADIENT_MATCHES" ]; then
  echo "❌ ERROR: Gradients are strictly forbidden by Shop design DNA:"
  echo "$GRADIENT_MATCHES"
  FAILURES=$((FAILURES + 1))
else
  echo "✅ Pass: No forbidden gradients found."
fi

# 5. Check for forbidden glassmorphism (backdrop-blur-*)
echo "5. Checking for forbidden glassmorphism (backdrop-blur-*)..."
GLASS_MATCHES=$(grep -rnEI \
  --exclude-dir=".next" \
  --exclude-dir="node_modules" \
  --exclude-dir=".agents" \
  "backdrop-blur" app/ components/ features/ styles/ 2>/dev/null || true)

if [ -n "$GLASS_MATCHES" ]; then
  echo "❌ ERROR: Glassmorphism / backdrop-blur is strictly forbidden by Shop design DNA:"
  echo "$GLASS_MATCHES"
  FAILURES=$((FAILURES + 1))
else
  echo "✅ Pass: No glassmorphism found."
fi

if [ $FAILURES -gt 0 ]; then
  echo "=== AUDIT FAILED with $FAILURES violations ==="
  exit 1
else
  echo "=== AUDIT PASSED: 100% Token Compliance ==="
  exit 0
fi
```

---

## 9. Downstream Teamwork & Implementation Roadmap

| Milestone | Subsystem | Token Responsibility |
|---|---|---|
| **M1** | Bootstrap & App Shell | Implement `styles/tokens.css` and `styles/globals.css`. Build App Shell rail and header using `bg-canvas`, `bg-surface`, `bg-shop-violet`, `rounded-card`, `rounded-pill`. |
| **M1** | shadcn/ui Components | Place pre-configured primitives (`Button`, `Card`, `Badge`, `Input`, `Slider`, `Tabs`, `Dialog`, `Drawer`) in `components/ui/` consuming token classes. |
| **M2** | Data, Physics & Calculations | Ensure `MockRepository` and thermal state categorizers output semantic state strings (`cold`, `comfort`, `hot`, `warn`) that bind directly to token badges. |
| **M3** | Shelter Designer | Style parameter panels, sliders, and layer-stack drawer using `rounded-card`, `rounded-pill`, `bg-surface`, `shadow-card`. |
| **M4** | Procedural 3D Thermal Twin | Utilize `lib/utils/tokens.ts` runtime extractor to supply normalized RGB uniforms for Cold, Comfort, and Hot shaders. |
| **M5** | Dashboard & Telemetry | Render 5 metric cards with `rounded-card` and `shadow-card`. Feed Recharts curves with `var(--color-shop-violet)` and `var(--color-thermal-comfort)`. |
| **M6** | Simulation & Advanced Modules | Stepper checklist, comparison diff cards, and PDF report styling adhering strictly to token palette. |
| **M7** | Verification & Hardening | Execute `scripts/verify-tokens.sh` and ensure 0 violations. |

---

## 10. Conclusion

This specification provides an exhaustive, mathematically precise, and structurally verified design system foundation for TRUESHEL V2. By confining all colors, radii, shadows, and fonts exclusively to `/styles/tokens.css` and bridging to shadcn/ui, Recharts, and Three.js through Tailwind v4 utilities, CSS variables, and dynamic DOM extraction, the application guarantees 100% design fidelity with zero risk of style fragmentation or hardcoded token leakage.
