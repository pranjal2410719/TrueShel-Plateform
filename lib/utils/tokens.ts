/**
 * lib/utils/tokens.ts
 *
 * Runtime token extractor for TRUESHEL V2.
 * Allows Three.js shaders and SVG charts to dynamically consume
 * tokens defined in styles/tokens.css without hardcoding hex strings.
 */

export const TOKEN_NAMES = {
  // Canvas & Surfaces
  canvas: '--color-canvas',
  surface: '--color-surface',
  surfaceHover: '--color-surface-hover',
  surfaceSubtle: '--color-surface-subtle',

  // Primary Accent
  shopViolet: '--color-shop-violet',
  shopVioletHover: '--color-shop-violet-hover',
  shopVioletSubtle: '--color-shop-violet-subtle',
  shopVioletBorder: '--color-shop-violet-border',

  // Neutrals
  slateInk: '--color-slate-ink',
  slateSecondary: '--color-slate-secondary',
  slateMuted: '--color-slate-muted',
  warmFog: '--color-warm-fog',
  borderSubtle: '--color-border-subtle',

  // Semantic Thermal State Overlays
  thermalCold: '--color-thermal-cold',
  thermalColdSubtle: '--color-thermal-cold-subtle',
  thermalComfort: '--color-thermal-comfort',
  thermalComfortSubtle: '--color-thermal-comfort-subtle',
  thermalHot: '--color-thermal-hot',
  thermalHotSubtle: '--color-thermal-hot-subtle',
  thermalWarn: '--color-thermal-warn',
  thermalWarnSubtle: '--color-thermal-warn-subtle',
} as const;

export type TokenKey = keyof typeof TOKEN_NAMES;

/**
 * Reads a CSS custom property directly from document root.
 * Safe for client-side rendering.
 */
export function getCssToken(variableName: string): string {
  if (typeof window === 'undefined' || !document.documentElement) {
    return '';
  }
  return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
}

/**
 * Converts a hex string from getCssToken into normalized RGB numbers [0..1]
 * for Three.js shaders and uniforms without hardcoding hex anywhere.
 */
export function getTokenRgbNormalized(tokenVariable: string): [number, number, number] {
  const hex = getCssToken(tokenVariable);
  if (!hex || !hex.startsWith('#')) {
    return [0.5, 0.5, 0.5]; // neutral default
  }
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
  return [r, g, b];
}

/**
 * Returns a CSS var() string for SVG attributes (e.g. Recharts stroke/fill).
 */
export function tokenVar(key: TokenKey): string {
  return `var(${TOKEN_NAMES[key]})`;
}
