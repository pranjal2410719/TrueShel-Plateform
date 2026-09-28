import fs from 'node:fs';
import path from 'node:path';

/**
 * 14 Primary Navigation Routes from ORIGINAL_REQUEST.md & PROJECT.md
 */
export const CANONICAL_PRIMARY_ROUTES = [
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
  '/reports',
  '/settings'
];

/**
 * Nested sub-routes per subsystem
 */
export const CANONICAL_SUBROUTES = {
  shelter: [
    '/shelter/geometry',
    '/shelter/envelope',
    '/shelter/materials',
    '/shelter/openings',
    '/shelter/thermal-mass',
    '/shelter/pcm',
    '/shelter/summary'
  ],
  simulation: [
    '/simulation/running',
    '/simulation/temperature',
    '/simulation/heat-flow',
    '/simulation/solar',
    '/simulation/comfort',
    '/simulation/thermal-state'
  ],
  resilience: [
    '/resilience/autonomy',
    '/resilience/climate-risk',
    '/resilience/degradation',
    '/resilience/failure-intelligence'
  ]
};

/**
 * Maps a URL route path to its expected Next.js 15 App Router filesystem relative path
 */
export function routeToAppFilePath(route) {
  if (route === '/') {
    return 'app/page.tsx';
  }
  if (route === '/onboarding') {
    return 'app/onboarding/page.tsx';
  }
  // All other workspace routes live inside app/(workspace)/<route>/page.tsx
  const subPath = route.startsWith('/') ? route.slice(1) : route;
  return `app/(workspace)/${subPath}/page.tsx`;
}

/**
 * Audits filesystem for App Router route files
 */
export function checkRoutesFilesystem(projectRoot) {
  const status = {
    rootLayout: fs.existsSync(path.join(projectRoot, 'app/layout.tsx')),
    workspaceLayout: fs.existsSync(path.join(projectRoot, 'app/(workspace)/layout.tsx')),
    routes: {}
  };

  const allRoutes = [
    ...CANONICAL_PRIMARY_ROUTES,
    ...CANONICAL_SUBROUTES.shelter,
    ...CANONICAL_SUBROUTES.simulation,
    ...CANONICAL_SUBROUTES.resilience
  ];

  for (const route of allRoutes) {
    const expectedRelPath = routeToAppFilePath(route);
    const expectedFullPath = path.join(projectRoot, expectedRelPath);
    // Also check alternate without (workspace) group if needed
    const fallbackPath = path.join(projectRoot, `app/${route === '/' ? '' : route.slice(1)}/page.tsx`);
    
    const exists = fs.existsSync(expectedFullPath) || fs.existsSync(fallbackPath);
    status.routes[route] = {
      expectedPath: expectedRelPath,
      exists,
      actualPath: fs.existsSync(expectedFullPath) ? expectedRelPath : (fs.existsSync(fallbackPath) ? path.relative(projectRoot, fallbackPath) : null)
    };
  }

  return status;
}
