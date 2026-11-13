/** Derive public solution/operation routes and the default description from App literature. */
import type { FireuxMetaContent } from '../../runtime/app/literature/types'
import type { FireuxSeoConfig } from './seo-config'
import { normalizePaths } from './seo-routes'

const NON_INDEXABLE_SOLUTION_STATUSES = new Set([
  'coming-soon',
  'planned',
  'later',
])

function resolveLocalSolutionPath(
  solution: NonNullable<FireuxMetaContent['solutions']>[number]
): string | undefined {
  if (solution.external === true) return undefined
  const destination = String(solution.to || '').trim()
  if (
    /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(destination) ||
    destination.includes('\\')
  )
    return undefined
  return normalizePaths([destination || `/solutions/${solution.slug}`])[0]
}

export function resolveContentSeo(
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
    staticPaths: normalizePaths([
      ...(seo?.staticPaths || []),
      ...(solutionPaths.length ? ['/solutions', ...solutionPaths] : []),
      ...(operationPaths.length ? ['/operations', ...operationPaths] : []),
    ]),
  }
}
