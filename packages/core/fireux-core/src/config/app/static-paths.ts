// Concurrent edit — 2026-07-21 13:07 CEST — Operation detail surfaces: include declared pages in static SEO paths.
import type { FireuxMetaContent } from './meta-content'
import type { FireuxSeoConfig } from './seo'

const NON_INDEXABLE_SOLUTION_STATUSES = new Set([
  'coming-soon',
  'planned',
  'later',
])

function normalizePublicPath(input: unknown): string | undefined {
  if (typeof input !== 'string') return undefined
  const trimmed = input.trim()
  if (!trimmed) return undefined
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

function mergeStaticPaths(paths: readonly unknown[]): string[] {
  const seen = new Set<string>()
  const merged: string[] = []

  for (const path of paths) {
    const normalized = normalizePublicPath(path)
    if (!normalized || seen.has(normalized)) continue
    seen.add(normalized)
    merged.push(normalized)
  }

  return merged
}

function resolveLocalSolutionPath(
  solution: NonNullable<FireuxMetaContent['solutions']>[number]
): string | undefined {
  if (solution.external === true) return undefined
  const destination = String(solution.to || '').trim()
  if (/^https?:\/\//i.test(destination)) return undefined
  return normalizePublicPath(destination || `/solutions/${solution.slug}`)
}

export function resolveSeoConfig(
  seo: FireuxSeoConfig | undefined,
  meta: FireuxMetaContent | undefined
): FireuxSeoConfig | undefined {
  const solutionPaths = (meta?.solutions || [])
    .filter(
      (solution) =>
        !solution.status ||
        !NON_INDEXABLE_SOLUTION_STATUSES.has(solution.status)
    )
    .map((solution) => resolveLocalSolutionPath(solution))
    .filter((path): path is string => Boolean(path))
  const operationPaths = (meta?.operations || [])
    .map((operation) => operation.slug)
    .filter((slug): slug is string =>
      Boolean(slug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
    )
    .map((slug) => `/operations/${slug}`)

  const defaultDescription =
    seo?.defaultDescription?.trim() || meta?.seo?.description?.trim()
  if (!solutionPaths.length && !operationPaths.length && !defaultDescription)
    return seo

  return {
    ...(seo || {}),
    ...(defaultDescription ? { defaultDescription } : {}),
    staticPaths: mergeStaticPaths([
      ...(seo?.staticPaths || []),
      ...(solutionPaths.length ? ['/solutions', ...solutionPaths] : []),
      ...(operationPaths.length ? ['/operations', ...operationPaths] : []),
    ]),
  }
}
