// Concurrent edit — 2026-07-20 16:27 CEST — Workspace Spine pass: validate Portfolio selection only after membership and collection outcomes are composed.
// Concurrent edit — 2026-07-21 22:31 CEST — Workspace family alignment: make Portfolio core own target ids and membership outcome.
import { computed } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import {
  useWorkspace,
  type WorkspaceSource,
} from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { workspaceData } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceData'
import { useWorkspaceEntityRuntime } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceEntityRuntime'
import { useWorkspaceFamilyRuntime } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceFamilyRuntime'
import { useWorkspaceTargets } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceTargets'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { usePortfolioCollection } from '../../firestore/fetch/usePortfolioCollection'
import {
  usePortfolioInterface,
  type PortfolioSurface,
} from '../../firestore/utils/view/usePortfolioInterface'
import { PortfolioStorage } from '../../../models/portfolio.model.ts'
import { usePortfolioWorkspaceDemoData } from './usePortfolioWorkspaceDemoData'

export type PortfolioWorkspaceEntity = PortfolioSurface & {
  id?: string
  tagline?: string
  image_url?: string
}
/**
 * FireUX stack family: Workspace-backed root entity.
 * Entity: Portfolio.
 * Canon:
 * - docs/fireux-canon.md
 * - packages/core/fireux-docs/src/runtime/concepts/stacks/README.md
 * Contract:
 * - packages/extensions/fireux-properties/docs/contract.md
 *
 * This file adapts Portfolio root/app authority sources into the private /workspace/portfolio selected runtime.
 * It should not own Portfolio child operation records; those live under workspace/portfolio/operations.
 */
function createPortfolioWorkspace() {
  const workspaceRoot = useWorkspace('portfolio')
  const workspaceTargets = useWorkspaceTargets({ family: 'portfolio' })
  const { uid } = useAuth()
  const normalizedUid = computed(() => normalizeString(uid.value))
  const { pill } = usePortfolioInterface()
  const targetFilter = computed(() => {
    if (workspaceRoot.source.value === 'demo') return {}
    return workspaceTargets.filter({
      operatorId: normalizedUid.value,
    })
  })
  const liveCollection = usePortfolioCollection({
    source: workspaceRoot.source,
    filter: targetFilter,
  })
  const demoData = usePortfolioWorkspaceDemoData(
    computed(() => workspaceRoot.source.value === 'demo')
  )
  const targetPortfolios = computed<PortfolioWorkspaceEntity[]>(() =>
    workspaceRoot.source.value === 'demo'
      ? (demoData.data.value ?? []).flatMap((scenario) => {
          if (!scenario.portfolio) return []
          const item = pill(scenario.portfolio)
          return item ? [{ ...scenario.portfolio, ...item }] : []
        })
      : liveCollection.portfolios.value
  )
  const targetData = computed(() => {
    const type =
      workspaceRoot.source.value === 'demo'
        ? 'demo'
        : workspaceRoot.source.value === 'test'
          ? 'test'
          : 'live'
    return targetPortfolios.value.map((portfolio) =>
      workspaceData(type, portfolio)
    )
  })
  const targetsPending = computed(() =>
    workspaceRoot.source.value === 'demo'
      ? demoData.pending.value
      : liveCollection.pending.value
  )
  const targetsError = computed(() =>
    workspaceRoot.source.value === 'demo'
      ? demoData.error.value
      : liveCollection.error.value
  )
  const sourceTargetsOutcome = computed(() =>
    workspaceRoot.source.value === 'demo'
      ? demoData.outcome.value
      : liveCollection.outcome.value
  )
  const membershipAwareTargetsOutcome =
    workspaceTargets.resolveOutcome(sourceTargetsOutcome)
  const targetsOutcome = computed(() =>
    workspaceRoot.source.value === 'demo'
      ? sourceTargetsOutcome.value
      : membershipAwareTargetsOutcome.value
  )

  const entity = useWorkspaceEntityRuntime<PortfolioWorkspaceEntity>({
    family: 'portfolio',
    storageFamily: PortfolioStorage.rootCollection,
    targetData,
    targetOutcome: targetsOutcome,
    getId: (portfolio) =>
      normalizeString((portfolio as PortfolioWorkspaceEntity)?.id),
    mode: workspaceRoot.source,
    userId: normalizedUid,
    enforcedTargetId: workspaceTargets.singleTargetId,
  })

  const selectedPortfolio = computed<PortfolioWorkspaceEntity | null>(
    () =>
      entity.selection.selectedTarget.value as PortfolioWorkspaceEntity | null
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
    source: WorkspaceSource = workspaceRoot.source.value
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
    targeting: workspaceTargets,
    selection,
    runtime: entity.runtime,
    actions,
  }
}

export function usePortfolioWorkspace() {
  return useWorkspaceFamilyRuntime('portfolio', createPortfolioWorkspace)
}
