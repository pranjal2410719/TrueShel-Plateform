# Handoff Report: Explorer M1-2 Design System & `styles/tokens.css`

## 1. Observation
1. **Design System Mandate in `ORIGINAL_REQUEST.md` (lines 13–25, 237, 243–247):**
   - *"All styling is driven by the Shop design token system (provided in design.md). Tokens must be implemented in a dedicated `styles/tokens.css` file (CSS custom properties + Tailwind v4 `@theme` block) that is imported once and never duplicated. Every component uses only token-referenced values — no hardcoded hex, no inline pixel values, no ad-hoc Tailwind classes that bypass tokens."* (lines 15–16)
   - Key Shop DNA:
     - *"White canvas `#f2f4f5` background, `#ffffff` surface cards"* (line 18)
     - *"Single saturated accent: Shop Violet `#5433eb` (primary actions, key metrics, active nav states)"* (line 19)
     - *"28px card radius, 9999px pill/button/input radius, 20px inner image radius"* (line 20)
     - *"GT Standard font family (fallback: Inter, system-ui) — hierarchy through tracking, not weight contrast"* (line 21)
     - *"Dual-layer soft shadow on elevated cards: `rgba(0,0,0,0.1) 0 4px 6px -1px, rgba(0,0,0,0.1) 0 2px 4px -2px`"* (line 22)
     - *"No gradients, no glassmorphism, no neon — engineering precision through whitespace and typography"* (line 23)
     - *"Semantic thermal state colors are semantic overlays on top of the achromatic shell (cold/comfort/hot), not decorative"* (line 24)
   - Acceptance Criteria:
     - *"`styles/tokens.css` is the only file containing color hex values, border-radius values, shadow definitions, and font-family strings — no duplicates elsewhere"* (line 237)
     - *"Primary action buttons (Run Simulation, Save Design, Optimize, Export) use Shop Violet `#5433eb` fill with white text"* (line 243)
     - *"All metric/data cards use 28px border radius and the dual-layer soft shadow"* (line 244)
     - *"All inputs and pill controls use `border-radius: 9999px`"* (line 245)
     - *"No hardcoded color values in any `.tsx` or `.css` file outside `styles/tokens.css`"* (line 246)
     - *"Font family resolves to GT Standard (or Inter fallback) at all text sizes"* (line 247)
2. **Thermal State Definitions (`ORIGINAL_REQUEST.md` line 148, `PROJECT.md` line 198):**
   - Cold: `#3b82f6` ($\le 12^\circ\text{C}$)
   - Comfort: `#22c55e` ($18^\circ\text{C} – 26^\circ\text{C}$)
   - Hot: `#ef4444` ($\ge 35^\circ\text{C}$)
   - Intermediate / Warn: `#f59e0b` ($12^\circ\text{C} – 18^\circ\text{C}$ and $26^\circ\text{C} – 35^\circ\text{C}$)
3. **Tailwind CSS v4 Configuration Architecture (`PROJECT.md` lines 5, 94–96):**
   - Tailwind v4 eliminates `tailwind.config.js` and moves all theme definitions into CSS `@theme` blocks.
   - `styles/tokens.css` is imported by `styles/globals.css`, which is imported by `app/layout.tsx`.
4. **Shadcn/ui & UI Primitive Integration (`teamwork_preview_spec_miner_survey_1/survey_report.md` Section 8):**
   - Shadcn components rely on standard CSS variables (`--background`, `--foreground`, `--card`, `--primary`, `--radius`). These must be mapped in `:root` inside `tokens.css` to `var(--color-canvas)`, `var(--color-shop-violet)`, etc., to avoid duplicating hex codes or radii.

---

## 2. Logic Chain
1. **Observation 1 & 3 $\rightarrow$ Single Source of Truth Structure:**
   - Because `styles/tokens.css` is strictly required to be the *only* file containing raw hex codes, pixel radii, and shadow values, all design tokens must be consolidated into a single `@theme` block in `styles/tokens.css`.
   - Tailwind v4's compiler automatically parses `@theme` and synthesizes corresponding utility classes (`bg-canvas`, `bg-surface`, `bg-shop-violet`, `text-slate-ink`, `rounded-card`, `rounded-pill`, `rounded-inner`, `shadow-card`).
2. **Observation 4 $\rightarrow$ shadcn/ui Variable Bridging:**
   - Shadcn primitives expect `--background`, `--foreground`, `--primary`, and `--radius`. By appending a `:root` block inside `styles/tokens.css` that maps these variables directly to `var(--color-canvas)`, `var(--color-shop-violet)`, and `var(--radius-card)`, shadcn/ui works out of the box without introducing any separate or conflicting token definitions.
3. **Observation 1 (Hex Isolation) $\rightarrow$ Zero-Hardcoding in Charts & WebGL:**
   - Recharts (SVG) and Three.js/R3F (WebGL shaders) require color values. If developers were to hardcode `#5433eb` or `#3b82f6` in `.tsx` files, line 246 of `ORIGINAL_REQUEST.md` would be violated.
   - Therefore, SVG chart components must use `var(--color-shop-violet)` directly in SVG attributes (`stroke`, `fill`).
   - For Three.js shaders, a client-side utility `lib/utils/tokens.ts` queries the computed style (`getComputedStyle(document.documentElement).getPropertyValue('--color-thermal-cold')`) and normalizes it to linear RGB for shader uniforms. This completely eliminates hardcoded hex strings from `.ts` and `.tsx` source code.
4. **Observation 1 (Negative Directives) $\rightarrow$ Strict Prohibitions:**
   - Because gradients, glassmorphism, and neon glows are explicitly forbidden, utility classes like `bg-gradient-*` and `backdrop-blur-*` must be actively barred via static analysis.

---

## 3. Caveats
1. **System Font Fallback:** If `GT Standard` font files are not locally bundled in the repository, the font stack gracefully falls back to `Inter`, `system-ui`, and `sans-serif`. Font rendering hierarchy relies on letter tracking (`tracking-tight`, `tracking-normal`, `tracking-wide`) which behaves consistently across both GT Standard and Inter.
2. **SSR DOM Access for Tokens:** `getComputedStyle` cannot execute on the Node.js server during SSR. The utility `lib/utils/tokens.ts` handles this by checking `typeof window === 'undefined'` and returning safe neutral fallbacks during server prerendering.
3. **Tailwind v4 Pre-release Variations:** Tailwind CSS v4 syntax requires `@import "tailwindcss";` at the top of the entry stylesheet. In TRUESHEL V2, `tokens.css` defines `@import "tailwindcss";` and `@theme`, while `globals.css` imports `./tokens.css` and establishes the base layer.

---

## 4. Conclusion
The complete, definitive specification for `styles/tokens.css` has been formulated, fully documented, and delivered in:
`/home/dev/Desktop/projects/trueShel/.agents/teamwork/teamwork_preview_explorer_m1_2/exploration_report.md`

Key Deliverables Specified:
1. **`styles/tokens.css`**: Complete `@theme` block containing canvas (`#f2f4f5`), surface (`#ffffff`), Shop Violet (`#5433eb`), neutrals, semantic thermal state tokens (`#3b82f6`, `#22c55e`, `#ef4444`, `#f59e0b`), border radii (`28px`, `9999px`, `20px`), soft dual-layer shadow, and font stacks, plus `:root` shadcn/ui bindings.
2. **`styles/globals.css`**: Base layer styles and scrollbar aesthetics consuming token variables with zero raw hex codes.
3. **`lib/utils/tokens.ts`**: TypeScript runtime token extractor for Recharts and React Three Fiber WebGL shaders.
4. **shadcn/ui Component Blueprints**: Pre-configured implementations of `Button`, `Card`, `Badge`, `Input`, `Slider`, `Tabs`, `Dialog`, `Drawer`, `Switch`, and `Tooltip`.
5. **`scripts/verify-tokens.sh`**: Automated verification script to guarantee 100% token compliance and prevent hardcoded hex/radius leaks.

---

## 5. Verification Method
To independently verify token isolation, design system compliance, and zero-hardcoding:

1. **Verify Token Centralization:**
   Inspect `/home/dev/Desktop/projects/trueShel/.agents/teamwork/teamwork_preview_explorer_m1_2/exploration_report.md` Section 4 (`styles/tokens.css`) to verify that all colors, radii, shadows, and font declarations are declared in one location.
2. **Hex Code Audit:**
   Execute ripgrep to ensure zero hex codes exist outside `styles/tokens.css`:
   ```bash
   grep -rnEI --exclude="styles/tokens.css" --exclude="*.svg" --exclude="*.json" --exclude-dir=".next" --exclude-dir="node_modules" --exclude-dir=".agents" "#[0-9a-fA-F]{3,8}" app/ components/ features/ lib/ stores/ types/ styles/
   ```
   *Expected result: 0 matches.*
3. **Arbitrary Radius & Shadow Audit:**
   ```bash
   grep -rnEI --exclude-dir=".next" --exclude-dir="node_modules" --exclude-dir=".agents" "rounded-\[" app/ components/ features/ styles/
   grep -rnEI --exclude-dir=".next" --exclude-dir="node_modules" --exclude-dir=".agents" "shadow-\[" app/ components/ features/ styles/
   ```
   *Expected result: 0 matches.*
4. **Forbidden Gradients & Glassmorphism Audit:**
   ```bash
   grep -rnEI --exclude-dir=".next" --exclude-dir="node_modules" --exclude-dir=".agents" "bg-gradient-" app/ components/ features/ styles/
   grep -rnEI --exclude-dir=".next" --exclude-dir="node_modules" --exclude-dir=".agents" "backdrop-blur" app/ components/ features/ styles/
   ```
   *Expected result: 0 matches.*
5. **Automated Verification Script:**
   Run `bash scripts/verify-tokens.sh` (once project is initialized) to confirm exit code 0.
