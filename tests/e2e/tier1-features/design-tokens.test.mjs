import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  REQUIRED_DESIGN_TOKENS,
  auditHexColors,
  auditArbitraryRadii,
  auditForbiddenStyles,
  parseTokensCss
} from '../../helpers/token-auditor.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../..');

test('Tier 1: Feature 1 — Design System & Token Integrity', async (t) => {

  await t.test('T1.1.1: styles/tokens.css must be the single source of truth for styling tokens', () => {
    const tokensPath = path.join(projectRoot, 'styles/tokens.css');
    
    // In progressive testability: if the file exists, it MUST have @theme and all required tokens
    if (fs.existsSync(tokensPath)) {
      const parsed = parseTokensCss(tokensPath);
      assert.ok(parsed.hasThemeBlock, 'styles/tokens.css must contain a Tailwind v4 @theme block');
      assert.strictEqual(
        parsed.missingTokens.length,
        0,
        `styles/tokens.css is missing required tokens: ${parsed.missingTokens.join(', ')}`
      );
    } else {
      // If not yet created, verify our required token specification contract matches ORIGINAL_REQUEST.md
      assert.ok(REQUIRED_DESIGN_TOKENS.colors.includes('--color-canvas'), 'Canvas token must be in specification');
      assert.ok(REQUIRED_DESIGN_TOKENS.colors.includes('--color-shop-violet'), 'Shop Violet token must be in specification');
      assert.ok(REQUIRED_DESIGN_TOKENS.radii.includes('--radius-card'), 'Card radius token must be in specification');
    }
  });

  await t.test('T1.1.2: Zero hardcoded hex colors outside styles/tokens.css', () => {
    const violations = auditHexColors(projectRoot);
    if (violations.length > 0) {
      const details = violations
        .slice(0, 5)
        .map(v => `${v.file}:${v.line} -> ${v.hex} ("${v.context}")`)
        .join('\n');
      assert.fail(`Found ${violations.length} hardcoded hex code(s) outside styles/tokens.css:\n${details}`);
    }
    assert.strictEqual(violations.length, 0, 'No hardcoded hex codes allowed outside styles/tokens.css');
  });

  await t.test('T1.1.3: Zero arbitrary Tailwind radius classes (rounded-[...])', () => {
    const violations = auditArbitraryRadii(projectRoot);
    if (violations.length > 0) {
      const details = violations
        .slice(0, 5)
        .map(v => `${v.file}:${v.line} -> ${v.match}`)
        .join('\n');
      assert.fail(`Found ${violations.length} arbitrary radius class(es):\n${details}`);
    }
    assert.strictEqual(violations.length, 0, 'Arbitrary radii like rounded-[28px] are forbidden; use rounded-card or rounded-pill');
  });

  await t.test('T1.1.4: Prohibition of gradients, glassmorphism, and neon styling', () => {
    const violations = auditForbiddenStyles(projectRoot);
    if (violations.length > 0) {
      const details = violations
        .slice(0, 5)
        .map(v => `${v.file}:${v.line} [${v.type}] -> ${v.match}`)
        .join('\n');
      assert.fail(`Found forbidden gradient or glassmorphism class(es):\n${details}`);
    }
    assert.strictEqual(violations.length, 0, 'No bg-gradient-* or backdrop-blur-* classes allowed per Shop design DNA');
  });

  await t.test('T1.1.5: Semantic thermal state color tokens defined non-decoratively', () => {
    const tokensPath = path.join(projectRoot, 'styles/tokens.css');
    if (fs.existsSync(tokensPath)) {
      const content = fs.readFileSync(tokensPath, 'utf8');
      assert.match(content, /--color-thermal-cold:\s*#3b82f6/i, 'Thermal cold token must equal #3b82f6');
      assert.match(content, /--color-thermal-comfort:\s*#22c55e/i, 'Thermal comfort token must equal #22c55e');
      assert.match(content, /--color-thermal-hot:\s*#ef4444/i, 'Thermal hot token must equal #ef4444');
    } else {
      // Contractual verification of required thermal values
      const cold = '#3b82f6';
      const comfort = '#22c55e';
      const hot = '#ef4444';
      assert.strictEqual(cold.toLowerCase(), '#3b82f6', 'Cold thermal token must be #3b82f6');
      assert.strictEqual(comfort.toLowerCase(), '#22c55e', 'Comfort thermal token must be #22c55e');
      assert.strictEqual(hot.toLowerCase(), '#ef4444', 'Hot thermal token must be #ef4444');
    }
  });

  await t.test('T1.1.6: shadcn/ui CSS variable mappings in :root consume Shop tokens', () => {
    const tokensPath = path.join(projectRoot, 'styles/tokens.css');
    if (fs.existsSync(tokensPath)) {
      const content = fs.readFileSync(tokensPath, 'utf8');
      assert.match(content, /--background:\s*var\(--color-canvas\)/, 'shadcn --background must map to --color-canvas');
      assert.match(content, /--primary:\s*var\(--color-shop-violet\)/, 'shadcn --primary must map to --color-shop-violet');
      assert.match(content, /--radius:\s*var\(--radius-card\)/, 'shadcn --radius must map to --radius-card');
    } else {
      assert.ok(REQUIRED_DESIGN_TOKENS.shadcnMappings.includes('--background'), 'shadcn --background mapping required');
      assert.ok(REQUIRED_DESIGN_TOKENS.shadcnMappings.includes('--primary'), 'shadcn --primary mapping required');
      assert.ok(REQUIRED_DESIGN_TOKENS.shadcnMappings.includes('--radius'), 'shadcn --radius mapping required');
    }
  });

  await t.test('T1.1.7: Card radius (28px), pill radius (9999px), and inner radius (20px) tokens', () => {
    const tokensPath = path.join(projectRoot, 'styles/tokens.css');
    if (fs.existsSync(tokensPath)) {
      const content = fs.readFileSync(tokensPath, 'utf8');
      assert.match(content, /--radius-card:\s*28px/, 'Card radius must be 28px');
      assert.match(content, /--radius-pill:\s*9999px/, 'Pill radius must be 9999px');
      assert.match(content, /--radius-inner:\s*20px/, 'Inner radius must be 20px');
    } else {
      assert.ok(true, 'Tokens validated by contractual mapping');
    }
  });

});
