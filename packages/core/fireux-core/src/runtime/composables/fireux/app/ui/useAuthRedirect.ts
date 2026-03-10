import { computed, toValue, type MaybeRefOrGetter, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../firebase/useAuth'

type AuthRedirectOptions = {
  unauthenticatedPath?: string
  bindErrorPath?: string
  enabled?: MaybeRefOrGetter<boolean>
}

export function useAuthRedirect(options: AuthRedirectOptions = {}) {
  const router = useRouter()
  const { isAuthenticated, isReady, hasAuthState, lastBindError } = useAuth()
  const isEnabled = computed(() => {
    if (options.enabled === undefined) return true
    return Boolean(toValue(options.enabled))
  })

  if (import.meta.client) {
    watch(
      [isReady, hasAuthState, isAuthenticated, lastBindError, isEnabled],
      ([ready, resolved, authed, bindError, enabled]: [boolean, boolean, boolean, unknown, boolean]) => {
        if (!enabled) return
        if (!ready) return
        if (!resolved) return
        if (authed) return
        if (bindError) {
          router.replace(options.bindErrorPath ?? '/').catch(() => {})
          return
        }
        router.replace(options.unauthenticatedPath ?? '/auth').catch(() => {})
      },
      { immediate: true }
    )
  }

  return { isAuthenticated, isReady, hasAuthState, lastBindError, isEnabled }
}
