import type { FireuxMetaContent } from '../../runtime/models/system/meta-content.model'
import type { FireuxSeoConfig } from './seo'

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

export function resolveSeoConfig(
  seo: FireuxSeoConfig | undefined,
  meta: FireuxMetaContent | undefined
): FireuxSeoConfig | undefined {
  const solutionPaths = (meta?.solutions || [])
    .map((solution) => normalizePublicPath(`/solutions/${solution.slug}`))
    .filter((path): path is string => Boolean(path))

  if (!solutionPaths.length) return seo

  return {
    ...(seo || {}),
    staticPaths: mergeStaticPaths([
      ...(seo?.staticPaths || []),
      '/solutions',
      ...solutionPaths,
    ]),
  }
}
