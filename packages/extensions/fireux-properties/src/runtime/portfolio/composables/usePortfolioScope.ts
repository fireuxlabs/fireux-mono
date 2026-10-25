import { usePortfolioAccess } from './usePortfolioAccess'
// Concurrent edit — 2026-07-20 16:15 CEST — Workspace Spine pass: centralize Portfolio operation write authorization.
// Concurrent edit — 2026-07-20 23:00 CEST — Both-Entity Authority: expose access-resolved target readiness for related Property reads.
import {
  computed,
  toValue,
  type MaybeRefOrGetter,
  type ComputedRef,
  type Ref,
} from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import type { Portfolio } from '../models/portfolio.model'
import type { WorkspaceTargetOutcome } from 'fireux-core/runtime/workspace/models/outcome'
import {
  resolvePortfolioWorkspaceCollectionPath,
  resolveRuntimePortfolioPath,
} from '../utils/portfolio-path'
import { usePortfolioFetch } from './firestore/fetch/usePortfolioFetch'

type WorkspaceDataType = 'live'

export type PortfolioScope = {
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

export function requirePortfolioWrite(
  runtimePortfolio: Pick<PortfolioScope, 'id' | 'canWrite'>,
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

export function usePortfolioScope(
  requestedId: MaybeRefOrGetter<string>
): PortfolioScope {
  const config = useFireUXConfig()
  const access = usePortfolioAccess()
  const requested = computed(() => String(toValue(requestedId) || '').trim())
  const readId = computed(() =>
    access.outcome.value === 'ready' &&
    access.ids.value.includes(requested.value)
      ? requested.value
      : ''
  )
  const source = usePortfolioFetch(readId)
  const workspace = {
    id: requested,
    data: source.portfolio,
    outcome: computed<WorkspaceTargetOutcome>(() =>
      access.outcome.value !== 'ready'
        ? access.outcome.value
        : !requested.value
          ? 'idle'
          : !readId.value
            ? 'empty'
            : source.outcome.value
    ),
  }
  const id = computed(() => normalizeString(workspace.id.value))
  const canRead = computed(
    () =>
      workspace.outcome.value === 'ready' &&
      Boolean(id.value) &&
      workspace.data.value?.id === id.value
  )
  const collectionPath = computed(() =>
    canRead.value
      ? resolvePortfolioWorkspaceCollectionPath(config.appId, 'live')
      : ''
  )
  return {
    dataType: computed(() => (canRead.value ? 'live' : null)),
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

export function usePortfolioChildPath(
  runtimePortfolio: Pick<PortfolioScope, 'collectionPath' | 'id'>,
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
