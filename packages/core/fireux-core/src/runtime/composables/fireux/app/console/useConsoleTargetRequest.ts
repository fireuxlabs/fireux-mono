import { useAsyncData } from '#imports'
import {
  computed,
  toValue,
  type ComputedRef,
  type MaybeRefOrGetter,
} from 'vue'
import type {
  ConsoleTargetIdItem,
  ConsoleTargetsResponse,
} from '../../../../../models/utils/console-target.model'
import { useAuth } from '../../firebase/useAuth'
import { useFireUXConfig } from '../FireUXConfig'
import { normalizeConsoleFamily } from './useConsole'
import type { ConsoleTargetOutcome } from './useConsoleIndex'

type ConsoleTargetRequestState<TItem extends ConsoleTargetIdItem> = {
  requestUid: string
  response: ConsoleTargetsResponse<TItem>
}

export function useConsoleTargetRequest<TItem extends ConsoleTargetIdItem>(
  family: string,
  options: { enabled?: MaybeRefOrGetter<boolean> } = {}
) {
  const normalizedFamily = normalizeConsoleFamily(family)
  const { appId } = useFireUXConfig()
  const { currentUser, hasAuthState } = useAuth()
  const enabled = computed(
    () => options.enabled === undefined || Boolean(toValue(options.enabled))
  )
  const uid = computed(() => String(currentUser.value?.uid ?? '').trim())
  const state = useAsyncData<ConsoleTargetRequestState<TItem> | null>(
    () => `console-targets-${appId}-${normalizedFamily}-${uid.value || 'signed-out'}`,
    async () => {
      const user = currentUser.value
      const requestUid = uid.value
      if (
        !enabled.value ||
        !import.meta.client ||
        !hasAuthState.value ||
        user?.uid !== requestUid
      ) {
        return null
      }
      const token = await user.getIdToken()
      const response = await $fetch<ConsoleTargetsResponse<TItem>>(
        `/api/console/${normalizedFamily}/targets`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      return { requestUid, response }
    },
    {
      server: false,
      lazy: true,
      dedupe: 'defer',
      watch: [enabled, hasAuthState, uid],
    }
  )
  const response = computed<ConsoleTargetsResponse<TItem> | null>(() => {
    if (!enabled.value) return null
    const value = state.data.value
    if (
      !value ||
      value.requestUid !== uid.value ||
      value.response.appId !== appId ||
      value.response.family !== normalizedFamily
    ) {
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
        (active.value &&
          !state.error.value &&
          (state.pending.value || !response.value)))
  )
  const error = computed<unknown | undefined>(() =>
    active.value ? (state.error.value ?? undefined) : undefined
  )
  const outcome = computed<ConsoleTargetOutcome>(() => {
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
    refresh: state.refresh as () => Promise<void>,
  }
}

export type UseConsoleTargetRequestResult<TItem extends ConsoleTargetIdItem> = {
  items: ComputedRef<TItem[]>
  response: ComputedRef<ConsoleTargetsResponse<TItem> | null>
  pending: ComputedRef<boolean>
  error: ComputedRef<unknown | undefined>
  outcome: ComputedRef<ConsoleTargetOutcome>
  refresh: () => Promise<void>
}
