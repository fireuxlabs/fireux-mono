import { watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../firebase/useAuth'

type AuthRedirectOptions = {
  unauthenticatedPath?: string
  bindErrorPath?: string
}

export function useAuthRedirect(options: AuthRedirectOptions = {}) {
  const router = useRouter()
  const { isAuthenticated, isReady, hasAuthState, lastBindError } = useAuth()

  if (import.meta.client) {
    watch(
      [isReady, hasAuthState, isAuthenticated, lastBindError],
      ([ready, resolved, authed, bindError]: [boolean, boolean, boolean, unknown]) => {
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

  return { isAuthenticated, isReady, hasAuthState, lastBindError }
}
