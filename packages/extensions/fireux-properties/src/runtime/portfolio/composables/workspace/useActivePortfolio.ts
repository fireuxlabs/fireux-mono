// Concurrent edit — 2026-07-20 16:15 CEST — Workspace Spine pass: centralize Portfolio operation write authorization.
// Concurrent edit — 2026-07-20 23:00 CEST — Both-Entity Authority: expose access-resolved target readiness for related Property reads.
import { computed, type ComputedRef, type Ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import type { Portfolio } from '../../models/portfolio.model'
import type { WorkspaceTargetOutcome } from 'fireux-core/runtime/composables/fireux/workspace/workspace-outcome'
import {
  resolvePortfolioWorkspaceCollectionPath,
  resolveRuntimePortfolioPath,
} from '../../utils/portfolio-path'
import { usePortfolioWorkspace } from './usePortfolioWorkspace'

type WorkspaceDataType = 'live'

export type ActivePortfolioRuntime = {
  dataType: ComputedRef<WorkspaceDataType | null>
  id: ComputedRef<string>
  entity: ComputedRef<Portfolio | null>
  rootCollection: ComputedRef<string>
  appId: ComputedRef<string>
  ecosystem: ComputedRef<string>
  targetOutcome: Readonly<Ref<WorkspaceTargetOutcome>>
  canRead: ComputedRef<boolean>
  canWrite: ComputedRef<boolean>
  collectionPath: ComputedRef<string>
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function requirePortfolioWorkspaceWrite(
  runtimePortfolio: Pick<ActivePortfolioRuntime, 'id' | 'canWrite'>,
  namespace: string
) {
  const portfolioId = normalizeString(runtimePortfolio.id.value)
  const label = normalizeString(namespace) || 'fireux-portfolio'

  if (!portfolioId) {
    throw new Error(`[${label}] portfolio id is required.`)
  }
  if (!runtimePortfolio.canWrite.value) {
    throw new Error(`[${label}] current operator does not have write access.`)
  }

  return portfolioId
}

export function useActivePortfolio(): ActivePortfolioRuntime {
  const config = useFireUXConfig()
  const workspace = usePortfolioWorkspace()
  const id = computed(() => normalizeString(workspace.id.value))
  const canRead = computed(() => workspace.outcome.value === 'ready' && Boolean(id.value) && workspace.data.value?.id === id.value)
  const collectionPath = computed(() => canRead.value ? resolvePortfolioWorkspaceCollectionPath(config.appId, 'live') : '')
  return {
    dataType: computed(() => canRead.value ? 'live' : null),
    id,
    entity: workspace.data,
    rootCollection: computed(() => collectionPath.value),
    appId: computed(() => config.appId),
    ecosystem: computed(() => config.ecosystem),
    targetOutcome: workspace.outcome,
    canRead,
    canWrite: canRead,
    collectionPath,
  }
}

export function usePortfolioWorkspaceChildPath(
  runtimePortfolio: Pick<ActivePortfolioRuntime, 'collectionPath' | 'id'>,
  childCollection: string
) {
  return computed(() =>
    resolveRuntimePortfolioPath(
      runtimePortfolio.collectionPath.value,
      runtimePortfolio.id.value,
      childCollection
    )
  )
}
