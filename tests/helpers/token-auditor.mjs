import fs from 'node:fs';
import path from 'node:path';

/**
 * Expected core design tokens that MUST be defined in styles/tokens.css
 */
export const REQUIRED_DESIGN_TOKENS = {
  colors: [
    '--color-canvas',
    '--color-surface',
    '--color-shop-violet',
    '--color-slate-ink',
    '--color-slate-secondary',
    '--color-slate-muted',
    '--color-warm-fog',
    '--color-border-subtle',
    '--color-thermal-cold',
    '--color-thermal-comfort',
    '--color-thermal-hot',
    '--color-thermal-warn'
  ],
  radii: [
    '--radius-card',
    '--radius-inner',
    '--radius-pill'
  ],
  shadows: [
    '--shadow-card'
  ],
  fonts: [
    '--font-sans'
  ],
  shadcnMappings: [
    '--background',
    '--foreground',
    '--card',
    '--primary',
    '--radius'
  ]
};

/**
 * Scans directories recursively collecting code files
 */
export function getCodeFiles(dir, extensions = ['.tsx', '.ts', '.jsx', '.js', '.css'], excludeDirs = ['node_modules', '.next', '.agents', '.git', 'tests', 'fixtures']) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!excludeDirs.includes(entry.name)) {
        results.push(...getCodeFiles(fullPath, extensions, excludeDirs));
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (extensions.includes(ext)) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

/**
 * Audits repository for hardcoded hex colors outside styles/tokens.css
 */
export function auditHexColors(projectRoot) {
  const codeFiles = getCodeFiles(projectRoot);
  const violations = [];
  const hexRegex = /#[0-9a-fA-F]{3,8}\b/g;

  for (const file of codeFiles) {
    const relPath = path.relative(projectRoot, file);
    // styles/tokens.css is the single approved home for hex colors
    if (relPath.replace(/\\/g, '/') === 'styles/tokens.css') {
      continue;
    }
    // Also ignore test mock fixtures or SVG files
    if (relPath.endsWith('.svg') || relPath.endsWith('.json')) {
      continue;
    }

    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      // Exclude comments or explicit eslint disables if any
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('/*')) return;

      const matches = line.match(hexRegex);
      if (matches) {
        matches.forEach(match => {
          violations.push({
            file: relPath,
            line: index + 1,
            hex: match,
            context: line.trim()
          });
        });
      }
    });
  }

  return violations;
}

/**
 * Audits repository for arbitrary radii e.g. rounded-[28px] or rounded-[17px]
 */
export function auditArbitraryRadii(projectRoot) {
  const codeFiles = getCodeFiles(projectRoot, ['.tsx', '.ts', '.jsx', '.js', '.css']);
  const violations = [];
  const arbitraryRadiusRegex = /rounded-\[[^\]]+\]/g;

  for (const file of codeFiles) {
    const relPath = path.relative(projectRoot, file);
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      const matches = line.match(arbitraryRadiusRegex);
      if (matches) {
        matches.forEach(match => {
          violations.push({
            file: relPath,
            line: index + 1,
            match,
            context: line.trim()
          });
        });
      }
    });
  }

  return violations;
}

/**
 * Audits repository for forbidden gradients, glassmorphism and neon
 */
export function auditForbiddenStyles(projectRoot) {
  const codeFiles = getCodeFiles(projectRoot, ['.tsx', '.ts', '.jsx', '.js', '.css']);
  const violations = [];
  const forbiddenPatterns = [
    { name: 'Gradient', regex: /\bbg-gradient-[a-z0-9-]+\b/g },
    { name: 'Glassmorphism', regex: /\bbackdrop-blur-[a-z0-9-]+\b/g }
  ];

  for (const file of codeFiles) {
    const relPath = path.relative(projectRoot, file);
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      for (const pattern of forbiddenPatterns) {
        const matches = line.match(pattern.regex);
        if (matches) {
          matches.forEach(match => {
            violations.push({
              file: relPath,
              line: index + 1,
              type: pattern.name,
              match,
              context: line.trim()
            });
          });
        }
      }
    });
  }

  return violations;
}

/**
 * Parses styles/tokens.css and returns extracted tokens
 */
export function parseTokensCss(tokensFilePath) {
  if (!fs.existsSync(tokensFilePath)) {
    return {
      exists: false,
      hasThemeBlock: false,
      tokensFound: [],
      missingTokens: [...REQUIRED_DESIGN_TOKENS.colors, ...REQUIRED_DESIGN_TOKENS.radii, ...REQUIRED_DESIGN_TOKENS.shadows, ...REQUIRED_DESIGN_TOKENS.fonts]
    };
  }

  const content = fs.readFileSync(tokensFilePath, 'utf8');
  const hasThemeBlock = /@theme\s*\{/.test(content);
  const foundTokens = [];

  const allExpected = [
    ...REQUIRED_DESIGN_TOKENS.colors,
    ...REQUIRED_DESIGN_TOKENS.radii,
    ...REQUIRED_DESIGN_TOKENS.shadows,
    ...REQUIRED_DESIGN_TOKENS.fonts
  ];

  for (const token of allExpected) {
    if (content.includes(token)) {
      foundTokens.push(token);
    }
  }

  const missingTokens = allExpected.filter(t => !foundTokens.includes(t));

  return {
    exists: true,
    hasThemeBlock,
    tokensFound: foundTokens,
    missingTokens,
    content
  };
}
