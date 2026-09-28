import fs from 'node:fs';
import path from 'node:path';

export const FORBIDDEN_PACKAGES = [
  'three-stdlib/loaders',
  'three/addons/loaders',
  'three/examples/jsm/loaders',
  'gltf-loader',
  'obj-loader',
  'fbx-loader',
  '@react-three/gltf',
  'cannon-es',
  '@react-three/cannon',
  'rapier',
  '@react-three/rapier',
  '@dimforge/rapier3d-compat',
  'ammo.js',
  '@react-three/xr',
  'three/addons/webxr'
];

export const FORBIDDEN_FILE_EXTENSIONS = [
  '.gltf',
  '.glb',
  '.obj',
  '.fbx',
  '.dae',
  '.blend',
  '.blend1',
  '.usdz',
  '.3ds',
  '.stl'
];

/**
 * Scans package.json for any forbidden package dependencies
 */
export function auditPackageJsonFor3D(packageJsonPath) {
  const violations = [];
  if (!fs.existsSync(packageJsonPath)) {
    return violations;
  }

  try {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const allDeps = {
      ...(pkg.dependencies || {}),
      ...(pkg.devDependencies || {}),
      ...(pkg.peerDependencies || {})
    };

    for (const [dep] of Object.entries(allDeps)) {
      for (const forbidden of FORBIDDEN_PACKAGES) {
        if (dep === forbidden || dep.includes(forbidden)) {
          violations.push({
            type: 'forbidden_dependency',
            package: dep,
            rule: `Forbidden 3D loader/physics/XR library: ${forbidden}`
          });
        }
      }
    }
  } catch (err) {
    violations.push({
      type: 'parse_error',
      message: err.message
    });
  }

  return violations;
}

/**
 * Recursively scans project directories for forbidden 3D model assets
 */
export function auditDirectoryFor3DModels(dir, excludeDirs = ['node_modules', '.next', '.agents', '.git']) {
  const violations = [];
  if (!fs.existsSync(dir)) return violations;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!excludeDirs.includes(entry.name)) {
        violations.push(...auditDirectoryFor3DModels(fullPath, excludeDirs));
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (FORBIDDEN_FILE_EXTENSIONS.includes(ext)) {
        violations.push({
          file: fullPath,
          extension: ext,
          rule: `Pure Three.js procedural constraint violated: found external 3D asset ${entry.name}`
        });
      }
    }
  }

  return violations;
}

/**
 * Audits source code files for forbidden imports
 */
export function auditSourceForForbiddenImports(projectRoot) {
  const violations = [];
  const searchDirs = ['app', 'components', 'features', 'lib', 'stores'];

  for (const dirName of searchDirs) {
    const targetDir = path.join(projectRoot, dirName);
    if (!fs.existsSync(targetDir)) continue;

    const files = getFilesRecursive(targetDir, ['.ts', '.tsx', '.js', '.jsx']);
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      for (const forbidden of FORBIDDEN_PACKAGES) {
        if (content.includes(`from '${forbidden}'`) || content.includes(`from "${forbidden}"`)) {
          violations.push({
            file: path.relative(projectRoot, file),
            forbiddenPackage: forbidden
          });
        }
      }
    }
  }

  return violations;
}

function getFilesRecursive(dir, exts) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getFilesRecursive(full, exts));
    } else if (exts.includes(path.extname(entry.name))) {
      results.push(full);
    }
  }
  return results;
}
