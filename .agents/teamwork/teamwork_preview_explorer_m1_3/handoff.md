# Handoff Report — Explorer M1-3: App Shell, Layout & Route Hierarchy

## 1. Observation

1. **`ORIGINAL_REQUEST.md` (lines 30–42, 44–69)**:
   - "A persistent desktop-first application shell: left sidebar navigation rail (64px icon-only, expands to labeled), top header bar (project selector + 'Run Simulation' action), main content area"
   - "Navigation routes: Overview / Dashboard, Climate, Shelter, Simulation, Compare, Intelligence, Thermal Twin, Reports, Settings"
   - "Route group `(workspace)` with shared layout for all authenticated sections; `/onboarding` outside the group"
   - "Responsive breakpoints: Desktop (1440+) primary, Laptop (1024–1439), Tablet (768–1023), Mobile (<768 simplified)"
   - "Framer Motion page transitions and micro-interactions"
   - File architecture explicitly prescribes all routes and directories under `app/`: `app/layout.tsx`, `app/page.tsx`, `app/onboarding/page.tsx`, and `app/(workspace)/` containing 11 primary feature folders plus sub-routes for `shelter/`, `simulation/`, and `resilience/`.
2. **`ORIGINAL_REQUEST.md` (lines 235–246)**:
   - "Sidebar nav collapses to icon-only at <1024px and a bottom bar at <768px"
   - "All pages are responsive: no horizontal scroll at 1440px, 1024px, 768px, or 375px viewport widths"
   - "Primary action buttons (Run Simulation, Save Design, Optimize, Export) use Shop Violet `#5433eb` fill with white text"
   - "All metric/data cards use 28px border radius and the dual-layer soft shadow"
   - "All inputs and pill controls use `border-radius: 9999px`"
3. **`PROJECT.md` (lines 9–10, 15–56, 108–117)**:
   - "Navigation & Routing: Persistent App Shell (64px desktop rail expanding to 240px, top header bar with Shop Violet CTA, mobile bottom bar <768px). 14 primary navigation routes + 17 nested sub-routes."
   - Explicit directory layout with 14 primary routes (`/`, `/onboarding`, `/dashboard`, `/climate`, `/shelter`, `/simulation`, `/simulation/results`, `/compare`, `/optimization`, `/recommendation`, `/resilience`, `/thermal-twin`, `/reports`, `/settings`) and 17 sub-routes (`/shelter/*` [7 sub-routes], `/simulation/*` [6 deep-dives + running], `/resilience/*` [4 sub-routes]).
4. **`survey_report.md` in `teamwork_preview_spec_miner_survey_1` (lines 354–368, 431–453)**:
   - Breakpoint specifications for Desktop (>=1440px), Laptop (1024-1439px), Tablet (768-1023px), and Mobile (<768px).
   - Framer Motion page variants: `initial: { opacity: 0, y: 6 }`, `animate: { opacity: 1, y: 0, transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] } }`.

## 2. Logic Chain

1. *From Observation 1 & 3*, the application routing architecture is split into two distinct tiers: an unauthenticated/isolated `/onboarding` route at the root level without the persistent shell, and all authenticated engineering workspaces grouped under `app/(workspace)/layout.tsx` which injects `AppShell`.
2. *From Observation 1 & 2*, the persistent App Shell requires three synchronized components:
   - A collapsible left sidebar rail (`components/layout/sidebar-rail.tsx`) providing 64px icon-only navigation expanding to 240px with labeled text, active route indicators (`bg-shop-violet-subtle text-shop-violet rounded-pill`), and accessible tooltips.
   - A persistent top header bar (`components/layout/header-bar.tsx`) containing brand identity, project selector dropdown with live thermal status pill, mock data indicator pill, and the primary "Run Simulation" Shop Violet CTA.
   - A mobile bottom navigation bar (`components/layout/mobile-bottom-bar.tsx`) activating exclusively on viewports `<768px` with 5 primary touch destinations (Dashboard, Shelter, Simulation, Thermal Twin, More).
3. *From Observation 1 & 3*, 14 primary navigation routes and 17 nested sub-routes must be implemented as distinct Next.js pages. To ensure deep linking into single-page workspaces like `/shelter` and `/simulation` without losing client state, sub-routes render the unified parent workspace with the target tab pre-selected.
4. *From Observation 2*, zero horizontal scroll across 1440px, 1024px, 768px, and 375px viewports requires strict CSS layout rules: applying `min-w-0` to all flex children, wrapping tables and charts in responsive containment cards with internal scroll, and ensuring outer body `overflow-x: hidden`.
5. *From Observation 1 & 4*, page transitions and micro-interactions must use Framer Motion with snappy easing (`duration: 0.18s, ease: [0.16, 1, 0.3, 1]`) and `layoutId` spring indicators for active pills to provide an engineering command center feel.

## 3. Caveats

1. **Server vs Client Components**: Next.js 15 App Router defaults to React Server Components (RSC). Layout components (`AppShell`, `SidebarRail`, `HeaderBar`, `MobileBottomBar`, `PageTransition`) rely on browser APIs (`localStorage`, `window.innerWidth`), React hooks (`useState`, `useEffect`), and router hooks (`usePathname`, `useRouter`), and must be marked with `"use client"`.
2. **Sub-Route State Preservation**: When navigating between `/shelter/geometry` and `/shelter/envelope`, re-mounting the R3F canvas must be avoided to prevent WebGL context loss. The sub-routes should ideally pass tab keys to the unified `ShelterWorkspace` component or use URL search parameters/tab synchronization.
3. **No External Fonts Bundled**: The font stack is configured to prioritize `"GT Standard"` if available, falling back to `Inter` (via `next/font/google`) and system sans-serif.

## 4. Conclusion

The architectural specification and implementation designs for the TRUESHEL V2 persistent App Shell, Workspace Layout, Isolated Onboarding, Route Hierarchy (14 primary + 17 sub-routes), and Framer Motion interaction system are fully detailed in:
`/home/dev/Desktop/projects/trueShel/.agents/teamwork/teamwork_preview_explorer_m1_3/exploration_report.md`

All layout rules, responsive breakpoint behavior, component contracts, and zero-horizontal-scroll enforcement mechanisms are defined and ready for immediate implementation by the Milestone 1 builder agent.

## 5. Verification Method

1. **Verify Report Generation**:
   Confirm existence and completeness of `exploration_report.md`:
   ```bash
   test -f /home/dev/Desktop/projects/trueShel/.agents/teamwork/teamwork_preview_explorer_m1_3/exploration_report.md && echo "REPORT_EXISTS"
   ```
2. **Verify Route Topology Coverage**:
   Inspect Section 4.1 of `exploration_report.md` to ensure all 14 primary routes (`/`, `/onboarding`, `/dashboard`, `/climate`, `/shelter`, `/simulation`, `/simulation/results`, `/compare`, `/optimization`, `/recommendation`, `/resilience`, `/thermal-twin`, `/reports`, `/settings`) and 17 sub-routes are enumerated with store bindings.
3. **Post-Implementation Viewport Audit**:
   Once builder creates the routes and shell, run viewport verification across target widths:
   ```bash
   # Verify zero horizontal scroll across breakpoints:
   # 1440px (Desktop), 1024px (Laptop), 768px (Tablet), 375px (Mobile)
   # Check: document.documentElement.scrollWidth === document.documentElement.clientWidth
   ```
4. **Token Leakage Check**:
   Ensure zero raw hex codes or unauthorized border radii are used in layout components:
   ```bash
   grep -rnI --exclude="styles/tokens.css" --exclude="*.svg" "#" components/layout/ app/
   ```
   Must return 0 results.
