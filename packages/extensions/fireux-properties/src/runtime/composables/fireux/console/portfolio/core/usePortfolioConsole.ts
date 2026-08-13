// Concurrent edit — 2026-07-20 16:27 CEST — Console Spine pass: validate Portfolio selection only after membership and collection outcomes are composed.
// Concurrent edit — 2026-07-21 22:31 CEST — Console family alignment: make Portfolio core own target ids and membership outcome.
import { computed } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import {
  useConsole,
  type ConsoleSource,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { consoleData } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleData'
import { useConsoleEntityRuntime } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleEntityRuntime'
import { useConsoleFamilyRuntime } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleFamilyRuntime'
import { useConsoleTargets } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleTargets'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import {
  usePortfolioCollection,
} from '../../../firestore/portfolio/fetch/usePortfolioCollection'
import {
  usePortfolioInterface,
  type PortfolioSurface,
} from '../../../firestore/portfolio/utils/view/usePortfolioInterface'
import { PortfolioStorage } from '../../../../../models/portfolio.model'
import { usePortfolioConsoleDemoData } from './usePortfolioConsoleDemoData'

export type PortfolioConsoleEntity = PortfolioSurface & {
  id?: string
  tagline?: string
  image_url?: string
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
function createPortfolioConsole() {
  const consoleRoot = useConsole('portfolio')
  const consoleTargets = useConsoleTargets({ family: 'portfolio' })
  const { uid } = useAuth()
  const normalizedUid = computed(() => normalizeString(uid.value))
  const { pill } = usePortfolioInterface()
  const targetFilter = computed(() => {
    if (consoleRoot.source.value === 'demo') return {}
    return consoleTargets.filter({
      operatorId: normalizedUid.value,
    })
  })
  const liveCollection = usePortfolioCollection({
    source: consoleRoot.source,
    filter: targetFilter,
  })
  const demoData = usePortfolioConsoleDemoData(
    computed(() => consoleRoot.source.value === 'demo')
  )
  const targetPortfolios = computed<PortfolioConsoleEntity[]>(() =>
    consoleRoot.source.value === 'demo'
      ? (demoData.data.value ?? []).flatMap((scenario) => {
          if (!scenario.portfolio) return []
          const item = pill(scenario.portfolio)
          return item ? [{ ...scenario.portfolio, ...item }] : []
        })
      : liveCollection.portfolios.value
  )
  const targetData = computed(() => {
    const type =
      consoleRoot.source.value === 'demo'
        ? 'demo'
        : consoleRoot.source.value === 'test'
          ? 'test'
          : 'live'
    return targetPortfolios.value.map(portfolio => consoleData(type, portfolio))
  })
  const targetsPending = computed(() =>
    consoleRoot.source.value === 'demo'
      ? demoData.pending.value
      : liveCollection.pending.value
  )
  const targetsError = computed(() =>
    consoleRoot.source.value === 'demo'
      ? demoData.error.value
      : liveCollection.error.value
  )
  const sourceTargetsOutcome = computed(() =>
    consoleRoot.source.value === 'demo'
      ? demoData.outcome.value
      : liveCollection.outcome.value
  )
  const membershipAwareTargetsOutcome =
    consoleTargets.resolveOutcome(sourceTargetsOutcome)
  const targetsOutcome = computed(() =>
    consoleRoot.source.value === 'demo'
      ? sourceTargetsOutcome.value
      : membershipAwareTargetsOutcome.value
  )

  const entity = useConsoleEntityRuntime<PortfolioConsoleEntity>({
    family: 'portfolio',
    storageFamily: PortfolioStorage.rootCollection,
    targetData,
    targetOutcome: targetsOutcome,
    getId: (portfolio) =>
      normalizeString((portfolio as PortfolioConsoleEntity)?.id),
    mode: consoleRoot.source,
    userId: normalizedUid,
    enforcedTargetId: consoleTargets.singleTargetId,
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
    error: targetsError,
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
    targeting: consoleTargets,
    selection,
    runtime: entity.runtime,
    actions,
  }
}

export function usePortfolioConsole() {
  return useConsoleFamilyRuntime('portfolio', createPortfolioConsole)
}
