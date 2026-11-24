import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useKitchenAccess } from './useKitchenAccess'
import { useKitchenRead } from './useKitchenRead'

type AuthorizedKitchenOutcome =
  | 'pending'
  | 'denied'
  | 'missing'
  | 'error'
  | 'ready'

/** Acquire only the exact Kitchen granted to the current App membership. */
export function useAuthorizedKitchenRead(id: MaybeRefOrGetter<string>) {
  const { uid, hasAuthState, isAuthenticated, lastBindError } = useAuth()
  const access = useKitchenAccess()
  const requestedId = computed(() => toValue(id).trim())
  const authorization = computed(() => {
    if (!hasAuthState.value) return 'pending'
    if (!isAuthenticated.value) return lastBindError.value ? 'error' : 'denied'
    if (access.outcome.value === 'error') return 'error'
    if (access.outcome.value === 'pending') return 'pending'
    return access.outcome.value === 'ready' &&
      access.ids.value.includes(requestedId.value)
      ? 'granted'
      : 'denied'
  })
  const authorizedId = computed(() =>
    authorization.value === 'granted' ? requestedId.value : ''
  )
  const bindingKey = ref(0)
  watch(
    [uid, authorizedId],
    () => {
      bindingKey.value++
    },
    { flush: 'sync' }
  )
  const source = useKitchenRead(authorizedId, { hydrate: false, bindingKey })
  const outcome = computed<AuthorizedKitchenOutcome>(() => {
    if (authorization.value !== 'granted') return authorization.value
    switch (source.outcome.value) {
      case 'error':
        return (source.error.value as { code?: string } | undefined)?.code ===
          'permission-denied'
          ? 'denied'
          : 'error'
      case 'empty':
        return 'missing'
      case 'ready':
        return source.kitchen.value?.id === authorizedId.value
          ? 'ready'
          : 'pending'
      default:
        return 'pending'
    }
  })
  return {
    outcome,
    kitchen: computed(() =>
      outcome.value === 'ready' ? source.kitchen.value : null
    ),
  }
}
