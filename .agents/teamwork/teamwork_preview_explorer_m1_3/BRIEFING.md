# BRIEFING — 2026-09-27T04:22:00Z

## Mission
Investigate and specify the component architecture, layout contracts, responsive rules, and complete route skeleton hierarchy (14 primary + 17 sub-routes) for the TRUESHEL V2 persistent App Shell.

## 🔒 My Identity
- Archetype: explorer
- Roles: app shell, layout architecture, route hierarchy
- Working directory: /home/dev/Desktop/projects/trueShel/.agents/teamwork/teamwork_preview_explorer_m1_3/
- Original parent: 2ff9b767-e84a-4695-b8e1-456c6e9ec72d
- Milestone: M1 (App Shell & Design System)

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Strictly observe Shop design DNA and tokens from styles/tokens.css
- Persistent App Shell: 64px desktop rail (expands to 240px), top header bar with Shop Violet CTA, mobile bottom nav (<768px) with 5 destinations
- 14 primary routes and 17 sub-routes fully specified with skeletons
- Zero horizontal scroll across 1440px, 1024px, 768px, 375px viewports
- Framer Motion page transitions and micro-interactions specified
- File workspace convention: write only to /home/dev/Desktop/projects/trueShel/.agents/teamwork/teamwork_preview_explorer_m1_3/

## Current Parent
- Conversation ID: 2ff9b767-e84a-4695-b8e1-456c6e9ec72d
- Updated: not yet

## Investigation State
- **Explored paths**: ORIGINAL_REQUEST.md, PROJECT.md, survey_report.md, sibling explorer dispatches
- **Key findings**:
  - Persistent App Shell architecture specified: `AppShell`, `SidebarRail` (64px/240px), `HeaderBar` (project selector + "Run Simulation" Shop Violet CTA), `MobileBottomBar` (<768px, 5 touch targets).
  - Isolated `/onboarding` layout and page specified.
  - Complete catalog of 14 primary routes and 17 nested sub-routes specified with store dependencies and page skeletons.
  - Framer Motion transitions (`opacity: 0, y: 6` -> `1, 0`) and micro-interactions (spring `layoutId` pills, button compressions).
  - Zero-horizontal-scroll strategy across 1440px, 1024px, 768px, and 375px defined.
- **Unexplored areas**: None. Exploration complete.

## Key Decisions Made
- Define precise React/Next.js 15 App Router component interfaces and JSX architecture for App Shell components
- Fully itemize all 14 primary routes + 17 sub-routes with route path, layout tier, title, state access, and page skeleton requirements
- Define strict CSS and Tailwind utility constraints (`min-w-0`, responsive grid columns, card table containment) to enforce zero horizontal scroll across all target viewports

## Artifact Index
- DISPATCH.md — Initial dispatch message
- progress.md — Liveness heartbeat and milestone progress
- exploration_report.md — Detailed exploration report
- handoff.md — 5-component handoff report
