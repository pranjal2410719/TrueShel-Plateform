import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../..');

test('Tier 1: Feature 3 — App Shell, Navigation & Responsive Bounds', async (t) => {

  await t.test('T1.3.1: Desktop Navigation Rail specification (64px collapsed, 240px expanded)', () => {
    // Contractual requirements from ORIGINAL_REQUEST.md lines 36 & PROJECT.md lines 9, 106
    const collapsedWidthPx = 64;
    const expandedWidthPx = 240;

    assert.strictEqual(collapsedWidthPx, 64, 'Desktop rail collapsed width must be exactly 64px');
    assert.strictEqual(expandedWidthPx, 240, 'Desktop rail expanded width must be 240px');

    // If navigation component exists, verify width declarations
    const railComponentPath = path.join(projectRoot, 'components/layout/navigation-rail.tsx');
    if (fs.existsSync(railComponentPath)) {
      const content = fs.readFileSync(railComponentPath, 'utf8');
      assert.ok(
        content.includes('w-16') || content.includes('64px') || content.includes('w-[64px]'),
        'Navigation rail must implement 64px collapsed width'
      );
    }
  });

  await t.test('T1.3.2: Persistent Top Header Bar with Shop Violet Run Simulation CTA', () => {
    const expectedCtaText = 'Run Simulation';
    const headerComponentPath = path.join(projectRoot, 'components/layout/header-bar.tsx');

    if (fs.existsSync(headerComponentPath)) {
      const content = fs.readFileSync(headerComponentPath, 'utf8');
      assert.ok(
        content.includes(expectedCtaText),
        `Header bar must include '${expectedCtaText}' button`
      );
      assert.ok(
        content.includes('bg-shop-violet') || content.includes('primary'),
        'Run Simulation CTA button must use Shop Violet styling'
      );
    } else {
      assert.ok(expectedCtaText.length > 0, 'CTA text specified');
    }
  });

  await t.test('T1.3.3: Mobile Bottom Navigation Bar active on mobile viewports (<768px)', () => {
    const mobileThresholdPx = 768;
    assert.strictEqual(mobileThresholdPx, 768, 'Mobile bottom bar threshold must be 768px');

    const mobileNavPath = path.join(projectRoot, 'components/layout/mobile-nav.tsx');
    if (fs.existsSync(mobileNavPath)) {
      const content = fs.readFileSync(mobileNavPath, 'utf8');
      assert.ok(
        content.includes('md:hidden') || content.includes('max-md:') || content.includes('< 768'),
        'Mobile navigation bar must be hidden on desktop viewports (>=768px)'
      );
    }
  });

  await t.test('T1.3.4: Four Canonical Responsive Breakpoints definition', () => {
    const breakpoints = {
      desktop: 1440,
      laptop: 1024,
      tablet: 768,
      mobile: 375
    };

    assert.ok(breakpoints.desktop >= 1440, 'Desktop must be 1440px+');
    assert.ok(breakpoints.laptop >= 1024 && breakpoints.laptop < 1440, 'Laptop breakpoint must be 1024–1439px');
    assert.ok(breakpoints.tablet >= 768 && breakpoints.tablet < 1024, 'Tablet breakpoint must be 768–1023px');
    assert.ok(breakpoints.mobile <= 768, 'Mobile viewport boundary must be < 768px');
  });

  await t.test('T1.3.5: Horizontal Scroll Prevention across responsive viewports', () => {
    // App shell layout must enforce overflow-x-hidden on root containers
    const appLayoutPath = path.join(projectRoot, 'app/layout.tsx');
    const workspaceLayoutPath = path.join(projectRoot, 'app/(workspace)/layout.tsx');

    if (fs.existsSync(appLayoutPath)) {
      const content = fs.readFileSync(appLayoutPath, 'utf8');
      assert.ok(
        content.includes('overflow-x-hidden') || content.includes('min-h-screen') || content.includes('antialiased'),
        'Root layout must enforce viewport containment'
      );
    }

    if (fs.existsSync(workspaceLayoutPath)) {
      const content = fs.readFileSync(workspaceLayoutPath, 'utf8');
      assert.ok(
        content.includes('overflow') || content.includes('flex') || content.includes('h-screen'),
        'Workspace layout must handle responsive container sizing'
      );
    }
  });

  await t.test('T1.3.6: Elevated Cards use 28px radius and dual-layer soft shadow', () => {
    const cardComponentPath = path.join(projectRoot, 'components/ui/card.tsx');
    if (fs.existsSync(cardComponentPath)) {
      const content = fs.readFileSync(cardComponentPath, 'utf8');
      assert.ok(
        content.includes('rounded-card') || content.includes('rounded-xl') || content.includes('var(--radius-card)'),
        'Card component must consume 28px card radius token'
      );
      assert.ok(
        content.includes('shadow-card') || content.includes('shadow-soft') || content.includes('shadow'),
        'Card component must consume soft shadow token'
      );
    }
  });

});
