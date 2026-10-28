// Concurrent edit — 2026-07-20 16:04 CEST — Repo Efficiency Pass 1 of 6: make every dev page developer-only as well as build-only.
import {
  abortNavigation,
  createError,
  defineNuxtRouteMiddleware,
  navigateTo,
  useRuntimeConfig,
  useRouter,
} from '#imports'
import {
  createClientRouteCheck,
  resolveClientAuthState,
} from '../composables/navigation/route-auth'
import { resolvePostAuthDestination } from '../user/utils/onboarding-route'
const AUTH_WAIT_TIMEOUT_MS = 2500

function isDiagnosticsPath(path: string) {
  return path === '/diagnostics' || path.startsWith('/diagnostics/')
}

export default defineNuxtRouteMiddleware(async (to) => {
  const path = String(to.path || '')
  if (!isDiagnosticsPath(path)) return

  if (!import.meta.dev) {
    return abortNavigation(
      createError({
        statusCode: 404,
        statusMessage: 'Not found',
      })
    )
  }
  if (import.meta.server) return

  const runtime = useRuntimeConfig()
  const router = useRouter()
  const check = createClientRouteCheck(() => router.currentRoute.value.fullPath)
  try {
    const auth = await resolveClientAuthState(
      AUTH_WAIT_TIMEOUT_MS,
      check.signal
    )
    if (check.signal.aborted) return
    if (!auth.isAuthenticated) {
      return navigateTo(
        `/auth?redirect=${encodeURIComponent(resolvePostAuthDestination(to.fullPath))}`
      )
    }

    const developerId = String(runtime.public?.fireux?.developerId ?? '').trim()
    if (!developerId || auth.uid !== developerId) {
      return navigateTo('/dashboard')
    }
  } catch (error) {
    if (!check.signal.aborted) throw error
  } finally {
    check.dispose()
  }
})
