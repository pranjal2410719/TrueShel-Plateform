/**
 * lib/api/client.ts — TanStack Query client + base API fetcher
 * In mock mode (no NEXT_PUBLIC_API_URL), routes return mock data via caller.
 */

import { QueryClient } from '@tanstack/react-query';
import type { ZodType } from 'zod';

// ---------------------------------------------------------------------------
// Query client — shared singleton
// ---------------------------------------------------------------------------

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

// ---------------------------------------------------------------------------
// Environment helpers
// ---------------------------------------------------------------------------

function getApiBase(): string | null {
  // Next.js exposes NEXT_PUBLIC_* to the client bundle
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return null;
}

export const IS_MOCK_MODE = getApiBase() === null;

// ---------------------------------------------------------------------------
// apiFetch — validates responses with Zod at the boundary
// ---------------------------------------------------------------------------

/**
 * Fetch a JSON endpoint and validate the response body against a Zod schema.
 *
 * In mock mode (NEXT_PUBLIC_API_URL not set) this function returns `null`;
 * callers should fall back to MockRepository data in that case.
 *
 * @param url     Path relative to API base (e.g. '/simulations/123')
 * @param schema  Zod schema to validate the parsed JSON against
 * @returns       Validated response data, or null in mock mode
 */
export async function apiFetch<T>(
  url: string,
  schema: ZodType<T>,
): Promise<T | null> {
  const base = getApiBase();

  // --- Mock mode: caller is responsible for providing mock data ---
  if (!base) {
    return null;
  }

  const fullUrl = `${base}${url}`;

  const response = await fetch(fullUrl, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status, response.statusText, fullUrl);
  }

  const json: unknown = await response.json();

  // Validate at boundary — throws ZodError on schema mismatch
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    throw new SchemaValidationError(url, parsed.error.issues);
  }

  return parsed.data;
}

// ---------------------------------------------------------------------------
// POST variant
// ---------------------------------------------------------------------------

export async function apiPost<TBody, TResponse>(
  url: string,
  body: TBody,
  schema: ZodType<TResponse>,
): Promise<TResponse | null> {
  const base = getApiBase();
  if (!base) return null;

  const fullUrl = `${base}${url}`;

  const response = await fetch(fullUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new ApiError(response.status, response.statusText, fullUrl);
  }

  const json: unknown = await response.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    throw new SchemaValidationError(url, parsed.error.issues);
  }

  return parsed.data;
}

// ---------------------------------------------------------------------------
// Custom error types
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly statusText: string,
    public readonly url: string,
  ) {
    super(`API error ${statusCode} ${statusText} — ${url}`);
    this.name = 'ApiError';
  }
}

export class SchemaValidationError extends Error {
  constructor(
    public readonly url: string,
    public readonly issues: import('zod').ZodIssue[],
  ) {
    super(`Schema validation failed for ${url}: ${JSON.stringify(issues, null, 2)}`);
    this.name = 'SchemaValidationError';
  }
}
