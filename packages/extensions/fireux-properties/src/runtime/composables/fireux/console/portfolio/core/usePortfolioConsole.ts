import { computed, isRef } from 'vue'
import {
  normalizeConsoleString as normalizeString,
  useConsole,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { targetHasOperator } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleAuthority'
import { resolveConsoleEntityAppId } from 'fireux-core/runtime/composables/fireux/firestore/system/console/utils/resolveConsoleEntityCollectionPath'
import {
  usePublishConsoleHeader,
  type ConsoleHeaderData,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsoleHeader'
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
  const { appId } = useFireUXConfig()
  const { uid } = useAuth()
  const normalizedUid = computed(() => normalizeString(uid.value))
  const { pill } = usePortfolioInterface()
  const targetFilter = computed<PortfolioCollectionFilter>(() => {
    const explicitFilter = isRef(options.filter)
      ? (options.filter.value ?? {})
      : (options.filter ?? {})

    return {
      ...explicitFilter,
      operatorId: normalizedUid.value,
    }
  })
  const { portfolios: targetPortfolios } = usePortfolioCollection({
    filter: targetFilter,
  })

  const {
    selectedId,
    selectedEntity,
    selectEntity,
    clearSelection,
  } = useConsole<PortfolioConsoleEntity>('portfolio', {
    targetItems: targetPortfolios,
    getId: (portfolio) =>
      normalizeString((portfolio as PortfolioConsoleEntity)?.id),
  })

  const selectedPortfolio = computed<PortfolioConsoleEntity | null>(
    () => selectedEntity.value as PortfolioConsoleEntity | null
  )
  const portfolioId = computed(() => normalizeString(selectedPortfolio.value?.id))
  const activePortfolioAppId = computed(() =>
    resolveConsoleEntityAppId(selectedPortfolio.value, appId)
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

  const header = computed<ConsoleHeaderData>(() => {
    const target = selectedPortfolio.value as Record<string, unknown> | null
    if (!target) return null

    return {
      title: normalizeString(target.name) || normalizeString(target.id),
      subtitle: normalizeString(target.tagline) || undefined,
      imageUrl: normalizeString(target.image_url) || undefined,
    }
  })

  usePublishConsoleHeader('portfolio', header)

  const clearSelectedPortfolio = () => {
    clearSelection()
  }

  const selectPortfolio = (
    portfolioId: string,
  ) => {
    selectEntity(portfolioId)
  }
  const portfolios = {
    targets: targetPortfolios,
    count: computed(() => targetPortfolios.value.length),
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
