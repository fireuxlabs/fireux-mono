// Concurrent edit — 2026-07-20 23:29 CEST — Profile auth hydration fix: defer initial protected-route redirects through Nuxt readiness.
import {
  defineNuxtRouteMiddleware,
  navigateTo,
  onNuxtReady,
  showError,
  useNuxtApp,
  useRouter,
  useRuntimeConfig,
} from '#imports'
import {
  createClientRouteCheck,
  resolveClientAppAdmin,
  resolveClientAuthState,
} from '../composables/navigation/route-auth'

import { resolvePostAuthDestination } from '../user/utils/onboarding-route'
const AUTH_WAIT_TIMEOUT_MS = 2500

function isWorkspacePath(path: string) {
  return path === '/workspace' || path.startsWith('/workspace/')
}

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return
  const router = useRouter()

  const path = String(to.path || '')
  if (isWorkspacePath(path)) return

  const meta = to.meta as Record<string, unknown>
  const requiresAuth = Boolean(meta.requiresAuth)
  if (!requiresAuth) return

  const nuxtApp = useNuxtApp()
  const runtime = useRuntimeConfig()
  const redirectTo = (path: string) =>
    nuxtApp.runWithContext(() => navigateTo(path))

  const enforceAuth = async () => {
    const check = createClientRouteCheck(
      () => router.currentRoute.value.fullPath
    )
    try {
      const auth = await resolveClientAuthState(
        AUTH_WAIT_TIMEOUT_MS,
        check.signal
      )
      if (check.signal.aborted) return

      if (!auth.isAuthenticated) {
        return redirectTo(
          `/auth?redirect=${encodeURIComponent(resolvePostAuthDestination(to.fullPath))}`
        )
      }

      const roles = Array.isArray(meta.roles) ? meta.roles : []
      const needsDeveloper = roles.includes('developer')

      if (needsDeveloper) {
        const developerId = String(
          runtime.public?.fireux?.developerId || ''
        ).trim()
        if (!developerId || auth.uid !== developerId) {
          return redirectTo('/dashboard')
        }
      }

      const needsAdmin = roles.includes('admin')
      if (!needsAdmin) return

      const appId = String(runtime.public?.fireux?.id || '').trim()
      const databaseId = String(
        runtime.public?.firebaseEcosystem?.firebase?.databaseId || ''
      ).trim()
      const isAdmin = await resolveClientAppAdmin({
        uid: auth.uid,
        appId,
        databaseId,
        timeoutMs: 1500,
      })

      if (check.signal.aborted) return
      if (!isAdmin) {
        return redirectTo('/dashboard')
      }
    } catch (error) {
      if (!check.signal.aborted) throw error
    } finally {
      check.dispose()
    }
  }

  if (nuxtApp.isHydrating) {
    const guardedPath = to.fullPath
    onNuxtReady(() => {
      if (router.currentRoute.value.fullPath !== guardedPath) return
      void enforceAuth().catch((error) =>
        nuxtApp.runWithContext(() => showError(error))
      )
    })
    return
  }

  return enforceAuth()
})
