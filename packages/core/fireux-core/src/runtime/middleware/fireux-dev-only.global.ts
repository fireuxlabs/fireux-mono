// Concurrent edit — 2026-07-20 16:04 CEST — Repo Efficiency Pass 1 of 6: make every dev page developer-only as well as build-only.
import {
  abortNavigation,
  createError,
  defineNuxtRouteMiddleware,
  navigateTo,
  useRuntimeConfig,
} from '#imports'
import { resolveClientAuthState } from '../utils/routeAuthGuard'

const AUTH_WAIT_TIMEOUT_MS = 2500

function isDevPath(path: string) {
  return path === '/dev' || path.startsWith('/dev/')
}

export default defineNuxtRouteMiddleware(async (to) => {
  const path = String(to.path || '')
  if (!isDevPath(path)) return

  if (!import.meta.dev) {
    return abortNavigation(
      createError({
        statusCode: 404,
        statusMessage: 'Not found',
      })
    )
  }
  if (import.meta.server) return

  const auth = await resolveClientAuthState(AUTH_WAIT_TIMEOUT_MS)
  if (!auth.isAuthenticated) {
    return navigateTo(`/auth?redirect=${encodeURIComponent(to.fullPath)}`)
  }

  const runtime = useRuntimeConfig()
  const developerId = String(runtime.public?.fireux?.developerId ?? '').trim()
  if (!developerId || auth.uid !== developerId) {
    return navigateTo('/dashboard')
  }
})
