import type { AppPortfolio } from '../../../models/portfolio.model.ts'
import type { usePortfolioInterface } from '../utils/view/usePortfolioInterface'
import {
  resolvePortfolioId,
  type PortfolioCollectionDoc,
  type PortfolioCollectionItem,
  type PortfolioCollectionSource,
} from './portfolio-collection-contract'

type PortfolioSurfaceProjector = ReturnType<
  typeof usePortfolioInterface
>['surface']

export function composePortfolioCollectionTargets(input: {
  source: PortfolioCollectionSource
  usesTargetedRead: boolean
  roots: PortfolioCollectionDoc[]
  appSupport: AppPortfolio[]
  surface: PortfolioSurfaceProjector
  acceptAppSupport: (
    root: PortfolioCollectionDoc,
    appSupport: AppPortfolio | undefined
  ) => boolean
}): PortfolioCollectionItem[] {
  if (input.source === 'demo' || input.source === 'test') return []
  if (!input.usesTargetedRead) {
    return input.roots.reduce<PortfolioCollectionItem[]>(
      (normalized, portfolio) => {
        const item = input.surface({ portfolio })
        if (item) normalized.push(item)
        return normalized
      },
      []
    )
  }

  const rootById = new Map<string, PortfolioCollectionDoc>()
  const appSupportById = new Map<string, AppPortfolio>()

  for (const portfolio of input.roots) {
    const id = resolvePortfolioId(portfolio)
    if (id) rootById.set(id, { ...portfolio, id })
  }

  for (const appSupport of input.appSupport) {
    const id = resolvePortfolioId(appSupport)
    if (id) appSupportById.set(id, { ...appSupport, id })
  }

  const merged: PortfolioCollectionItem[] = []
  const seen = new Set<string>()

  for (const portfolio of input.roots) {
    const id = resolvePortfolioId(portfolio)
    if (!id || seen.has(id)) continue
    seen.add(id)

    const root = { ...(rootById.get(id) ?? {}), id }
    const appSupport = appSupportById.get(id)
    if (!input.acceptAppSupport(root, appSupport)) continue

    const item = input.surface({ portfolio: root, appSupport })
    if (item) merged.push(item)
  }

  return merged
}
