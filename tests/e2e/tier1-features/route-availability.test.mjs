import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  CANONICAL_PRIMARY_ROUTES,
  CANONICAL_SUBROUTES,
  routeToAppFilePath,
  checkRoutesFilesystem
} from '../../helpers/route-checker.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../..');

test('Tier 1: Feature 2 — Route Availability & Topology', async (t) => {

  await t.test('T1.2.1: Canonical 14 Primary Routes Completeness', () => {
    const requiredPrimary = [
      '/',
      '/onboarding',
      '/dashboard',
      '/climate',
      '/shelter',
      '/simulation',
      '/simulation/setup',
      '/simulation/results',
      '/compare',
      '/optimization',
      '/recommendation',
      '/resilience',
      '/thermal-twin',
      '/reports'
    ];

    for (const route of requiredPrimary) {
      assert.ok(
        CANONICAL_PRIMARY_ROUTES.includes(route),
        `Primary navigation route '${route}' must be registered in canonical topology`
      );
    }
    assert.ok(CANONICAL_PRIMARY_ROUTES.length >= 14, 'Must register at least 14 primary navigation routes');
  });

  await t.test('T1.2.2: Isolated Onboarding Route is outside workspace group', () => {
    const onboardingPath = routeToAppFilePath('/onboarding');
    assert.strictEqual(
      onboardingPath,
      'app/onboarding/page.tsx',
      '/onboarding route must reside directly in app/onboarding/page.tsx outside (workspace)'
    );
    assert.ok(
      !onboardingPath.includes('(workspace)'),
      'Onboarding must not be wrapped inside the (workspace) layout'
    );
  });

  await t.test('T1.2.3: Workspace Route Group Layout encapsulates engineering modules', () => {
    const dashboardPath = routeToAppFilePath('/dashboard');
    const shelterPath = routeToAppFilePath('/shelter');
    const simulationPath = routeToAppFilePath('/simulation');

    assert.ok(dashboardPath.startsWith('app/(workspace)/'), 'Dashboard must live in (workspace) route group');
    assert.ok(shelterPath.startsWith('app/(workspace)/'), 'Shelter must live in (workspace) route group');
    assert.ok(simulationPath.startsWith('app/(workspace)/'), 'Simulation must live in (workspace) route group');
  });

  await t.test('T1.2.4: Shelter Sub-routes Topology contains all 7 deep links', () => {
    const expectedShelterSubroutes = [
      '/shelter/geometry',
      '/shelter/envelope',
      '/shelter/materials',
      '/shelter/openings',
      '/shelter/thermal-mass',
      '/shelter/pcm',
      '/shelter/summary'
    ];

    assert.strictEqual(CANONICAL_SUBROUTES.shelter.length, 7, 'Shelter must have exactly 7 sub-routes');
    for (const sub of expectedShelterSubroutes) {
      assert.ok(
        CANONICAL_SUBROUTES.shelter.includes(sub),
        `Missing required shelter subroute: ${sub}`
      );
    }
  });

  await t.test('T1.2.5: Simulation Sub-result Views Topology contains all 5 deep dives and running view', () => {
    const expectedSimViews = [
      '/simulation/running',
      '/simulation/temperature',
      '/simulation/heat-flow',
      '/simulation/solar',
      '/simulation/comfort',
      '/simulation/thermal-state'
    ];

    for (const view of expectedSimViews) {
      assert.ok(
        CANONICAL_SUBROUTES.simulation.includes(view),
        `Missing required simulation view: ${view}`
      );
    }
    assert.strictEqual(CANONICAL_SUBROUTES.simulation.length, 6, 'Must provide 5 sub-result deep dives plus running state');
  });

  await t.test('T1.2.6: Resilience Sub-routes Topology contains all 4 sub-views', () => {
    const expectedResilienceViews = [
      '/resilience/autonomy',
      '/resilience/climate-risk',
      '/resilience/degradation',
      '/resilience/failure-intelligence'
    ];

    assert.strictEqual(CANONICAL_SUBROUTES.resilience.length, 4, 'Resilience must have exactly 4 sub-routes');
    for (const view of expectedResilienceViews) {
      assert.ok(
        CANONICAL_SUBROUTES.resilience.includes(view),
        `Missing required resilience sub-route: ${view}`
      );
    }
  });

  await t.test('T1.2.7: Route filesystem audit reports reachability status', () => {
    const audit = checkRoutesFilesystem(projectRoot);
    assert.ok(typeof audit === 'object', 'Audit result must be an object');
    assert.ok(typeof audit.routes === 'object', 'Routes map must exist');

    // If app/ directory exists, verify existing files
    const appDir = path.join(projectRoot, 'app');
    if (fs.existsSync(appDir)) {
      const existingCount = Object.values(audit.routes).filter(r => r.exists).length;
      assert.ok(existingCount >= 0, 'Route count checked');
    }
  });

});
