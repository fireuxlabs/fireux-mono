// Concurrent edit — 2026-07-20 23:29 CEST — Profile auth hydration fix: hold initial layout redirects through Nuxt readiness.
import { onNuxtReady, useNuxtApp } from '#imports'
import { computed, ref, toValue, type MaybeRefOrGetter, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/fireux/composables/fireux/firebase/useAuth'

type AuthRedirectOptions = {
  unauthenticatedPath?: string
  bindErrorPath?: string
  enabled?: MaybeRefOrGetter<boolean>
}

export function useAuthRedirect(options: AuthRedirectOptions = {}) {
  const nuxtApp = useNuxtApp()
  const router = useRouter()
  const { isAuthenticated, isReady, hasAuthState, lastBindError } = useAuth()
  const isNuxtReady = ref(!import.meta.client || !nuxtApp.isHydrating)
  const isEnabled = computed(() => {
    if (options.enabled === undefined) return true
    return Boolean(toValue(options.enabled))
  })

  if (import.meta.client) {
    if (!isNuxtReady.value) {
      onNuxtReady(() => {
        isNuxtReady.value = true
      })
    }

    watch(
      [
        isNuxtReady,
        isReady,
        hasAuthState,
        isAuthenticated,
        lastBindError,
        isEnabled,
      ],
      ([nuxtReady, authReady, resolved, authed, bindError, enabled]: [
        boolean,
        boolean,
        boolean,
        boolean,
        unknown,
        boolean,
      ]) => {
        if (!nuxtReady) return
        if (!enabled) return
        if (!authReady) return
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
