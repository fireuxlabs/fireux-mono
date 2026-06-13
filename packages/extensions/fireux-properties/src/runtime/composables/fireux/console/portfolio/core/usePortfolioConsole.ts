import { computed, isRef } from 'vue'
import { useConsoleSelection } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleSelection'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { useConsole } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { targetHasOperator } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleAccess'
import { resolveConsoleEntityAppId } from 'fireux-core/runtime/composables/fireux/firestore/system/console/utils/resolveConsoleEntityCollectionPath'
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

    if (Array.isArray(explicitFilter.ids)) return explicitFilter

    return {
      ...explicitFilter,
      operatorId: normalizedUid.value,
    }
  })
  const { portfolios: targetPortfolios, pending: targetsPending } = usePortfolioCollection({
    filter: targetFilter,
  })

  const {
    selectedId,
    selectedTarget,
    selectTarget,
    clearSelection,
  } = useConsoleSelection<PortfolioConsoleEntity>('portfolio', {
    targetItems: targetPortfolios,
    getId: (portfolio) =>
      normalizeString((portfolio as PortfolioConsoleEntity)?.id),
  })

  const selectedPortfolio = computed<PortfolioConsoleEntity | null>(
    () => selectedTarget.value as PortfolioConsoleEntity | null
  )
  const portfolioId = computed(() => normalizeString(selectedPortfolio.value?.id))
  const activePortfolioAppId = computed(() =>
    resolveConsoleEntityAppId(selectedPortfolio.value, consoleRoot.appId)
  )
  const rootCollection = computed(() =>
    PortfolioStorage.rootCollection
  )
  const readOnly = computed(() => false)
  const canWrite = computed(() =>
    !readOnly.value && targetHasOperator(selectedPortfolio.value, normalizedUid.value)
  )

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
    id: selectedId,
    entity: selectedPortfolio,
  }

  const clearSelectedPortfolio = () => {
    clearSelection()
  }

  const selectPortfolio = (
    portfolioId: string,
  ) => {
    selectTarget(portfolioId)
  }
  const portfolios = {
    targets: targetPortfolios,
    count: computed(() => targetPortfolios.value.length),
    pending: targetsPending,
  }
  const selection = {
    portfolio: selectedPortfolio,
    portfolioId,
    portfolioCard: portfolio,
    portfolioState,
    hasSelection: computed(() => Boolean(portfolioId.value)),
  }
  const runtime = {
    appId: activePortfolioAppId,
    rootCollection,
    readOnly,
    canWrite,
  }
  const actions = {
    selectPortfolio,
    clearSelectedPortfolio,
  }

  return {
    portfolios,
    selection,
    runtime,
    actions,
  }
}
