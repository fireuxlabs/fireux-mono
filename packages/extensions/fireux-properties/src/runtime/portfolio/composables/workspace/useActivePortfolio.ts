// Concurrent edit — 2026-07-20 16:15 CEST — Workspace Spine pass: centralize Portfolio operation write authorization.
// Concurrent edit — 2026-07-20 23:00 CEST — Both-Entity Authority: expose access-resolved target readiness for related Property reads.
import { computed, type ComputedRef, type Ref } from 'vue'
import type { WorkspaceTargetOutcome } from 'fireux-core/runtime/composables/fireux/workspace/workspace-outcome'
import {
  resolvePortfolioWorkspaceCollectionPath,
  resolveRuntimePortfolioPath,
} from './operations/Shared/shared'
import {
  usePortfolioWorkspace,
  type PortfolioWorkspaceEntity,
} from './core/usePortfolioWorkspace'
import { usePortfolioWorkspaceSelection } from './core/usePortfolioWorkspaceSelection'

type WorkspaceDataType = 'live'

export type ActivePortfolioRuntime = {
  dataType: ComputedRef<WorkspaceDataType | null>
  id: ComputedRef<string>
  entity: ComputedRef<PortfolioWorkspaceEntity | null>
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
  const selection = usePortfolioWorkspaceSelection()
  const {
    portfolios,
    selection: workspaceSelection,
    runtime,
  } = usePortfolioWorkspace()

  const id = computed(
    () =>
      normalizeString(workspaceSelection.portfolio.value?.id) ||
      selection.selectedId.value
  )
  const collectionPath = computed(() => {
    const dataType = runtime.dataType.value
    if (!id.value || !dataType) return ''

    return resolvePortfolioWorkspaceCollectionPath(
      runtime.appId.value,
      dataType
    )
  })
  const targetOutcome = portfolios.outcome
  const canRead = computed(
    () =>
      targetOutcome.value === 'ready' &&
      Boolean(normalizeString(workspaceSelection.portfolio.value?.id))
  )

  return {
    dataType: runtime.dataType,
    id,
    entity: workspaceSelection.portfolio,
    rootCollection: runtime.rootCollection,
    appId: runtime.appId,
    ecosystem: runtime.ecosystem,
    targetOutcome,
    canRead,
    canWrite: runtime.canWrite,
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
