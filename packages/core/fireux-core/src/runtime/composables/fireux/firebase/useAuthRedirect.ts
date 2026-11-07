// Concurrent edit — 2026-07-20 23:29 CEST — Profile auth hydration fix: hold initial layout redirects through Nuxt readiness.
import { onNuxtReady, useNuxtApp } from '#imports'
import { computed, ref, toValue, type MaybeRefOrGetter, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from './useAuth'
import {
  authRedirectPath,
  resolvePostAuthDestination,
} from '../../../user/utils/auth-redirect'
type AuthRedirectOptions = {
  unauthenticatedPath?: string
  bindErrorPath?: string
  enabled?: MaybeRefOrGetter<boolean>
}

export function useAuthRedirect(options: AuthRedirectOptions = {}) {
  const nuxtApp = useNuxtApp()
  const router = useRouter()
  let returnDestination = resolvePostAuthDestination(
    router.currentRoute.value.fullPath
  )
  const { isAuthenticated, isReady, hasAuthState, lastBindError } = useAuth()
  const isNuxtReady = ref(!import.meta.client || !nuxtApp.isHydrating)
  const isEnabled = computed(() => {
    if (options.enabled === undefined) return true
    return Boolean(toValue(options.enabled))
  })

  if (import.meta.client) {
    // Track the current destination without introducing another redirect trigger.
    watch(
      () => router.currentRoute.value.fullPath,
      (fullPath) => {
        if (fullPath.split(/[?#]/, 1)[0].replace(/\/+$/, '') !== '/auth') {
          returnDestination = resolvePostAuthDestination(fullPath)
        }
      },
      { flush: 'sync' }
    )
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
        router
          .replace(
            options.unauthenticatedPath ?? authRedirectPath(returnDestination)
          )
          .catch(() => {})
      },
      { immediate: true }
    )
  }

  return { isAuthenticated, isReady, hasAuthState, lastBindError, isEnabled }
}
