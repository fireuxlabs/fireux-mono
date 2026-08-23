// Concurrent edit — 2026-07-19 17:35 CEST — Profile privacy pass: opt current-user workspace targeting into app membership reads only.
// Concurrent edit — 2026-07-20 16:20 CEST — Workspace Spine pass: preserve App membership errors in target outcomes.
import { computed, unref, type ComputedRef, type Ref } from 'vue'
import { normalizeString, uniqueStrings } from '../../../utils/string'
import {
  normalizeWorkspaceFamily,
  useWorkspace,
  type WorkspaceAppMode,
} from './useWorkspace'
import type { WorkspaceTargetOutcome } from './useWorkspaceDirectoryIndex'
import { useWorkspaceTargetRequest } from './useWorkspaceTargetRequest'

type ValueRef<T> = Ref<T> | ComputedRef<T>

type UseWorkspaceTargetsOptions = {
  family: string
  globalTargetIds?: ValueRef<unknown[] | null | undefined>
}

type WorkspaceTargetFilter = Record<string, unknown>

export function useWorkspaceTargets(options: UseWorkspaceTargetsOptions) {
  const family = normalizeWorkspaceFamily(options.family)
  const workspaceRoot = useWorkspace(options.family)
  const mode: WorkspaceAppMode = workspaceRoot.mode
  const request = useWorkspaceTargetRequest(family)
  const globalTargetIds = computed(() =>
    uniqueStrings(
      options.globalTargetIds
        ? unref(options.globalTargetIds)
        : request.items.value.map((item) => item.id)
    )
  )
  const targetIds = computed(() => uniqueStrings(globalTargetIds.value))
  const canCreate = computed(() => workspaceRoot.canCreateTarget())
  const isTenant = mode === 'tenant'
  const isSingleTarget = computed(() => targetIds.value.length === 1)
  const isSingleTenantTarget = computed(() => isTenant && isSingleTarget.value)
  const singleTargetId = computed(() =>
    isSingleTarget.value ? (targetIds.value[0] ?? '') : ''
  )
  const filter = <TFilter extends WorkspaceTargetFilter>(base: TFilter) => ({
    ...base,
    ids: targetIds.value,
  })
  const pending = request.pending
  const error = request.error
  const resolveOutcome = (sourceOutcome: ValueRef<WorkspaceTargetOutcome>) =>
    computed<WorkspaceTargetOutcome>(() => {
      if (pending.value) return 'pending'
      if (error.value) return 'error'
      if (request.outcome.value === 'empty') return 'empty'
      if (request.outcome.value !== 'ready') return request.outcome.value
      return unref(sourceOutcome)
    })
  const debug = computed(() => ({
    family: normalizeString(family),
    appMode: mode,
    globalTargetIds: globalTargetIds.value,
    targetIds: targetIds.value,
    endpoint: `/api/workspace/${family}/targets`,
    targetPending: pending.value,
    targetError: error.value,
    canCreate: canCreate.value,
    isSingleTarget: isSingleTarget.value,
    isSingleTenantTarget: isSingleTenantTarget.value,
  }))

  return {
    workspace: workspaceRoot,
    mode,
    isTenant,
    isGlobal: mode === 'global',
    isStandalone: mode === 'standalone',
    globalTargetIds,
    targetIds,
    canCreate,
    isSingleTarget,
    isSingleTenantTarget,
    singleTargetId,
    filter,
    pending,
    error,
    resolveOutcome,
    refresh: request.refresh,
    debug,
  }
}
