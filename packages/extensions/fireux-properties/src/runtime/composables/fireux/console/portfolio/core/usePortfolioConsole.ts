import { computed, isRef } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import {
  useConsole,
  type ConsoleSource,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useConsoleEntityRuntime } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleEntityRuntime'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import {
  usePortfolioCollection,
  type PortfolioCollectionFilter,
} from '../../../firestore/portfolio/fetch/usePortfolioCollection'
import {
  usePortfolioInterface,
  type PortfolioSurface,
} from '../../../firestore/portfolio/utils/view/usePortfolioInterface'
import { PortfolioStorage } from '../../../../../models/portfolio.model'
import type { Ref } from 'vue'

export type PortfolioConsoleEntity = PortfolioSurface & {
  id?: string
  tagline?: string
  image_url?: string
}
type UsePortfolioConsoleOptions = {
  filter?:
    | PortfolioCollectionFilter
    | Ref<PortfolioCollectionFilter | null | undefined>
    | null
}

/**
 * FireUX stack family: Console-backed root entity.
 * Entity: Portfolio.
 * Canon:
 * - docs/fireux-canon.md
 * - packages/core/fireux-docs/src/runtime/concepts/stacks/README.md
 * Contract:
 * - packages/extensions/fireux-properties/docs/contract.md
 *
 * This file adapts Portfolio root/app authority sources into the private /console/portfolio selected runtime.
 * It should not own Portfolio child operation records; those live under console/portfolio/operations.
 */
export function usePortfolioConsole(options: UsePortfolioConsoleOptions = {}) {
  const consoleRoot = useConsole('portfolio')
  const { uid } = useAuth()
  const normalizedUid = computed(() => normalizeString(uid.value))
  const { pill } = usePortfolioInterface()
  const targetFilter = computed<PortfolioCollectionFilter>(() => {
    const explicitFilter = isRef(options.filter)
      ? (options.filter.value ?? {})
      : (options.filter ?? {})

    if (
      consoleRoot.source.value !== 'live' ||
      Array.isArray(explicitFilter.ids)
    ) return explicitFilter

    return {
      ...explicitFilter,
      operatorId: normalizedUid.value,
    }
  })
  const {
    portfolios: targetPortfolios,
    pending: targetsPending,
    error: targetsError,
    outcome: targetsOutcome,
  } = usePortfolioCollection({
    source: consoleRoot.source,
    filter: targetFilter,
  })

  const entity = useConsoleEntityRuntime<PortfolioConsoleEntity>({
    family: 'portfolio',
    storageFamily: PortfolioStorage.rootCollection,
    targetItems: targetPortfolios,
    targetPending: targetsPending,
    targetError: targetsError,
    getId: (portfolio) =>
      normalizeString((portfolio as PortfolioConsoleEntity)?.id),
    mode: consoleRoot.source,
    userId: normalizedUid,
  })

  const selectedPortfolio = computed<PortfolioConsoleEntity | null>(
    () => entity.selection.selectedTarget.value as PortfolioConsoleEntity | null
  )
  const portfolioId = entity.selection.entityId

  const portfolio = computed(() => {
    const target = selectedPortfolio.value
    if (!target) return null

    const card = pill(target)
    if (!card) return null

    return {
      ...card,
      subtitle: normalizeString(target.tagline),
    }
  })

  const portfolioState = {
    id: entity.selection.selectedId,
    entity: selectedPortfolio,
  }

  const clearSelectedPortfolio = () => {
    entity.actions.clearSelection()
  }

  const selectPortfolio = (
    portfolioId: string,
    source: ConsoleSource = consoleRoot.source.value
  ) => {
    entity.actions.selectTarget(portfolioId, source)
  }
  const portfolios = {
    targets: targetPortfolios,
    count: computed(() => targetPortfolios.value.length),
    pending: targetsPending,
    outcome: targetsOutcome,
  }
  const selection = {
    portfolio: selectedPortfolio,
    portfolioId,
    portfolioCard: portfolio,
    portfolioState,
    hasSelection: entity.selection.hasSelection,
  }
  const actions = {
    selectPortfolio,
    clearSelectedPortfolio,
  }

  return {
    portfolios,
    selection,
    runtime: entity.runtime,
    actions,
  }
}
