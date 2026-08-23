import { useState } from '#imports'
import {
  computed,
  toValue,
  watch,
  type ComputedRef,
  type MaybeRefOrGetter,
} from 'vue'
import type {
  WorkspaceTargetIdItem,
  WorkspaceTargetsResponse,
} from '../../../../models/utils/workspace-target.model.ts'
import { useAuth } from '../firebase/useAuth'
import { useFireUXConfig } from '../../../app/composables/config/FireUXConfig'
import { normalizeWorkspaceFamily } from './useWorkspace'
import type { WorkspaceTargetOutcome } from './useWorkspaceDirectoryIndex'

type WorkspaceTargetRequestState<TItem extends WorkspaceTargetIdItem> = {
  requestUid: string
  status: 'idle' | 'pending' | 'ready' | 'error'
  response: WorkspaceTargetsResponse<TItem> | null
  error?: unknown
}

const pendingRequests = new Map<string, Promise<void>>()

export function useWorkspaceTargetRequest<TItem extends WorkspaceTargetIdItem>(
  family: string,
  options: { enabled?: MaybeRefOrGetter<boolean> } = {}
) {
  const normalizedFamily = normalizeWorkspaceFamily(family)
  const { appId } = useFireUXConfig()
  const { currentUser, hasAuthState } = useAuth()
  const enabled = computed(
    () => options.enabled === undefined || Boolean(toValue(options.enabled))
  )
  const uid = computed(() => String(currentUser.value?.uid ?? '').trim())
  const state = useState<WorkspaceTargetRequestState<TItem>>(
    `workspace-target-request-${appId}-${normalizedFamily}`,
    () => ({ requestUid: '', status: 'idle', response: null })
  )
  const load = async () => {
    const user = currentUser.value
    const requestUid = uid.value
    if (
      !enabled.value ||
      !import.meta.client ||
      !hasAuthState.value ||
      !requestUid ||
      user?.uid !== requestUid
    ) {
      if (!enabled.value || hasAuthState.value) {
        state.value = { requestUid, status: 'idle', response: null }
      }
      return
    }
    if (
      state.value.requestUid === requestUid &&
      state.value.status === 'ready'
    ) {
      return
    }

    const requestKey = `${appId}:${normalizedFamily}:${requestUid}`
    const pendingRequest = pendingRequests.get(requestKey)
    if (pendingRequest) return pendingRequest

    const request = (async () => {
      state.value = { requestUid, status: 'pending', response: null }
      try {
        const token = await user.getIdToken()
        const response = await $fetch<WorkspaceTargetsResponse<TItem>>(
          `/api/workspace/${normalizedFamily}/targets`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (uid.value !== requestUid) return
        if (
          response.family !== normalizedFamily ||
          (response.appId !== undefined && response.appId !== appId)
        ) {
          throw new Error('Workspace target response scope mismatch.')
        }
        state.value = { requestUid, status: 'ready', response }
      } catch (error) {
        if (uid.value === requestUid) {
          state.value = {
            requestUid,
            status: 'error',
            response: null,
            error,
          }
        }
      } finally {
        pendingRequests.delete(requestKey)
      }
    })()
    pendingRequests.set(requestKey, request)
    return request
  }
  watch([enabled, hasAuthState, uid], () => void load(), { immediate: true })
  const response = computed<WorkspaceTargetsResponse<TItem> | null>(() => {
    if (!enabled.value) return null
    const value = state.value
    if (value.requestUid !== uid.value || value.status !== 'ready') {
      return null
    }
    return value.response
  })
  const items = computed<TItem[]>(() => response.value?.items ?? [])
  const active = computed(() => enabled.value && Boolean(uid.value))
  const pending = computed(
    () =>
      enabled.value &&
      (!hasAuthState.value ||
        (active.value && state.value.status === 'pending'))
  )
  const error = computed<unknown | undefined>(() =>
    active.value && state.value.requestUid === uid.value
      ? state.value.error
      : undefined
  )
  const outcome = computed<WorkspaceTargetOutcome>(() => {
    if (!enabled.value || !active.value) return 'idle'
    if (pending.value) return 'pending'
    if (error.value) return 'error'
    return items.value.length > 0 ? 'ready' : 'empty'
  })

  return {
    items,
    response,
    pending,
    error,
    outcome,
    refresh: async () => {
      if (state.value.requestUid === uid.value) {
        state.value = { requestUid: uid.value, status: 'idle', response: null }
      }
      await load()
    },
  }
}

export type UseWorkspaceTargetRequestResult<
  TItem extends WorkspaceTargetIdItem,
> = {
  items: ComputedRef<TItem[]>
  response: ComputedRef<WorkspaceTargetsResponse<TItem> | null>
  pending: ComputedRef<boolean>
  error: ComputedRef<unknown | undefined>
  outcome: ComputedRef<WorkspaceTargetOutcome>
  refresh: () => Promise<void>
}
