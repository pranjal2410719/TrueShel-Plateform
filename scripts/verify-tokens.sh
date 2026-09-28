#!/usr/bin/env bash
# scripts/verify-tokens.sh
# Verifies that NO hex codes, arbitrary pixel radii, or hardcoded shadows exist
# outside styles/tokens.css in TRUESHEL V2.

set -euo pipefail

echo "=== TRUESHEL V2 DESIGN TOKEN AUDIT ==="

FAILURES=0

# 1. Check for raw hex codes outside styles/tokens.css
echo "1. Checking for unauthorized hex color codes (#xxx or #xxxxxx)..."
HEX_MATCHES=$(grep -rnEI --exclude="tokens.css" \
  --exclude="*.svg" \
  --exclude="*.json" \
  --exclude-dir=".next" \
  --exclude-dir="node_modules" \
  --exclude-dir=".agents" \
  "#[0-9a-fA-F]{3,8}" app/ components/ features/ lib/ stores/ types/ styles/ 2>/dev/null || true)

if [ -n "$HEX_MATCHES" ]; then
  echo "❌ ERROR: Unauthorized hex codes found outside styles/tokens.css:"
  echo "$HEX_MATCHES"
  FAILURES=$((FAILURES + 1))
else
  echo "✅ Pass: No unauthorized hex colors found outside styles/tokens.css."
fi

# 2. Check for arbitrary border-radius brackets (e.g. rounded-[28px])
echo "2. Checking for arbitrary rounded-[...] classes..."
RADIUS_MATCHES=$(grep -rnEI \
  --exclude-dir=".next" \
  --exclude-dir="node_modules" \
  --exclude-dir=".agents" \
  "rounded-\[" app/ components/ features/ styles/ 2>/dev/null || true)

if [ -n "$RADIUS_MATCHES" ]; then
  echo "❌ ERROR: Arbitrary border radii found. Use rounded-card or rounded-pill:"
  echo "$RADIUS_MATCHES"
  FAILURES=$((FAILURES + 1))
else
  echo "✅ Pass: No arbitrary rounded-[...] classes found."
fi

# 3. Check for arbitrary shadow brackets (e.g. shadow-[...])
echo "3. Checking for arbitrary shadow-[...] classes..."
SHADOW_MATCHES=$(grep -rnEI \
  --exclude-dir=".next" \
  --exclude-dir="node_modules" \
  --exclude-dir=".agents" \
  "shadow-\[" app/ components/ features/ styles/ 2>/dev/null || true)

if [ -n "$SHADOW_MATCHES" ]; then
  echo "❌ ERROR: Arbitrary shadow classes found. Use shadow-card or shadow-dropdown:"
  echo "$SHADOW_MATCHES"
  FAILURES=$((FAILURES + 1))
else
  echo "✅ Pass: No arbitrary shadow-[...] classes found."
fi

# 4. Check for forbidden gradients
echo "4. Checking for forbidden gradients (bg-gradient-*)..."
GRADIENT_MATCHES=$(grep -rnEI \
  --exclude-dir=".next" \
  --exclude-dir="node_modules" \
  --exclude-dir=".agents" \
  "bg-gradient-" app/ components/ features/ styles/ 2>/dev/null || true)

if [ -n "$GRADIENT_MATCHES" ]; then
  echo "❌ ERROR: Gradients are strictly forbidden by Shop design DNA:"
  echo "$GRADIENT_MATCHES"
  FAILURES=$((FAILURES + 1))
else
  echo "✅ Pass: No forbidden gradients found."
fi

# 5. Check for forbidden glassmorphism (backdrop-blur-*)
echo "5. Checking for forbidden glassmorphism (backdrop-blur-*)..."
GLASS_MATCHES=$(grep -rnEI \
  --exclude-dir=".next" \
  --exclude-dir="node_modules" \
  --exclude-dir=".agents" \
  "backdrop-blur" app/ components/ features/ styles/ 2>/dev/null || true)

if [ -n "$GLASS_MATCHES" ]; then
  echo "❌ ERROR: Glassmorphism / backdrop-blur is strictly forbidden by Shop design DNA:"
  echo "$GLASS_MATCHES"
  FAILURES=$((FAILURES + 1))
else
  echo "✅ Pass: No glassmorphism found."
fi

if [ $FAILURES -gt 0 ]; then
  echo "=== AUDIT FAILED with $FAILURES violations ==="
  exit 1
else
  echo "=== AUDIT PASSED: 100% Token Compliance ==="
  exit 0
fi
