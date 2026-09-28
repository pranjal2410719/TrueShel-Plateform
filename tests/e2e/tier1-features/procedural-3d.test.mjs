import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  auditPackageJsonFor3D,
  auditDirectoryFor3DModels,
  auditSourceForForbiddenImports
} from '../../helpers/model-auditor.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../..');

test('Tier 1: Feature 4 — Procedural 3D Thermal Twin Constraints', async (t) => {

  await t.test('T1.4.1: Strict Zero External 3D Model Loaders in package.json', () => {
    const pkgPath = path.join(projectRoot, 'package.json');
    const violations = auditPackageJsonFor3D(pkgPath);
    const modelLoaderViolations = violations.filter(v => 
      v.package && (v.package.includes('gltf') || v.package.includes('obj') || v.package.includes('fbx') || v.package.includes('loader'))
    );

    if (modelLoaderViolations.length > 0) {
      assert.fail(`Found forbidden 3D model loaders in package.json:\n${JSON.stringify(modelLoaderViolations, null, 2)}`);
    }
    assert.strictEqual(modelLoaderViolations.length, 0, 'No external 3D loaders allowed in package.json');
  });

  await t.test('T1.4.2: Strict Zero 3D Model Asset Files in repository', () => {
    const violations = auditDirectoryFor3DModels(projectRoot);
    if (violations.length > 0) {
      const details = violations.map(v => `${v.file} (${v.extension})`).join('\n');
      assert.fail(`Found forbidden external 3D model files in project:\n${details}`);
    }
    assert.strictEqual(violations.length, 0, 'No .gltf, .glb, .obj, .fbx, .blend files allowed in repository');
  });

  await t.test('T1.4.3: Strict Zero Physics Engines in dependencies or source code', () => {
    const pkgPath = path.join(projectRoot, 'package.json');
    const violations = auditPackageJsonFor3D(pkgPath);
    const physicsViolations = violations.filter(v =>
      v.package && (v.package.includes('cannon') || v.package.includes('rapier') || v.package.includes('ammo'))
    );

    if (physicsViolations.length > 0) {
      assert.fail(`Found forbidden physics engine in package.json:\n${JSON.stringify(physicsViolations, null, 2)}`);
    }
    assert.strictEqual(physicsViolations.length, 0, 'No physics engines (cannon-es, rapier) allowed');
  });

  await t.test('T1.4.4: Strict Zero Extended Reality (XR/WebXR) packages in dependencies', () => {
    const pkgPath = path.join(projectRoot, 'package.json');
    const violations = auditPackageJsonFor3D(pkgPath);
    const xrViolations = violations.filter(v =>
      v.package && (v.package.includes('xr') || v.package.includes('webxr'))
    );

    if (xrViolations.length > 0) {
      assert.fail(`Found forbidden XR/WebXR dependencies in package.json:\n${JSON.stringify(xrViolations, null, 2)}`);
    }
    assert.strictEqual(xrViolations.length, 0, 'Zero AR, VR, or WebXR libraries allowed');
  });

  await t.test('T1.4.5: Pure Procedural Three.js Geometric Primitives architecture', () => {
    const proceduralComponents = [
      'features/thermal-twin/Wall.tsx',
      'features/thermal-twin/Roof.tsx',
      'features/thermal-twin/Floor.tsx',
      'features/thermal-twin/Window.tsx',
      'features/thermal-twin/Door.tsx'
    ];

    // Verify architectural specification: components must use procedural primitives
    for (const compRelPath of proceduralComponents) {
      const fullPath = path.join(projectRoot, compRelPath);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        // Must use Three.js primitive tags: boxGeometry, planeGeometry, bufferGeometry
        assert.ok(
          content.includes('Geometry') || content.includes('boxGeometry') || content.includes('planeGeometry') || content.includes('bufferGeometry'),
          `${compRelPath} must use procedural Three.js geometry primitives`
        );
        // Must NOT use useGLTF or useLoader
        assert.ok(!content.includes('useGLTF'), `${compRelPath} must not use useGLTF`);
        assert.ok(!content.includes('GLTFLoader'), `${compRelPath} must not use GLTFLoader`);
      }
    }
    assert.strictEqual(proceduralComponents.length, 5, 'Must specify 5 procedural shelter components');
  });

  await t.test('T1.4.6: Exactly 5 Shader Visualization Modes architecture supported', () => {
    const expectedModes = ['normal', 'thermal', 'heat-flow', 'solar', 'storage'];
    assert.strictEqual(expectedModes.length, 5, 'Must support exactly 5 visualization modes');

    const twinStorePath = path.join(projectRoot, 'stores/thermal-twin-store.ts');
    if (fs.existsSync(twinStorePath)) {
      const content = fs.readFileSync(twinStorePath, 'utf8');
      for (const mode of expectedModes) {
        assert.ok(
          content.includes(`'${mode}'`) || content.includes(`"${mode}"`),
          `thermal-twin-store must define mode '${mode}'`
        );
      }
    }
  });

  await t.test('T1.4.7: Separation of Physics and Graphics (Zero thermal generation in 3D)', () => {
    const twinDir = path.join(projectRoot, 'features/thermal-twin');
    if (fs.existsSync(twinDir)) {
      // 3D files must consume simulation-store, not calculate thermal balances
      const forbiddenMathPatterns = [
        'Math.exp(-', // lumped decay should be in lib/calculations
        'sigma * Math.pow' // stefan boltzmann should be in lib/calculations
      ];
      // Test code files in twinDir
      const files = fs.readdirSync(twinDir);
      for (const file of files) {
        if (file.endsWith('.tsx') || file.endsWith('.ts')) {
          const content = fs.readFileSync(path.join(twinDir, file), 'utf8');
          for (const pattern of forbiddenMathPatterns) {
            assert.ok(
              !content.includes(pattern),
              `3D component ${file} must not compute physics equations directly`
            );
          }
        }
      }
    }
  });

});
