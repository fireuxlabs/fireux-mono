import { defineNuxtRouteMiddleware, navigateTo, useRuntimeConfig } from '#imports'
import {
  resolveClientAppAdmin,
  resolveClientAuthState,
} from '../utils/routeAuthGuard'

const AUTH_WAIT_TIMEOUT_MS = 2500
const USER_WAIT_TIMEOUT_MS = 1500

function isConsolePath(path: string) {
  return path === '/console' || path.startsWith('/console/')
}

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  const path = String(to.path || '')
  if (isConsolePath(path)) return

  const meta = to.meta as Record<string, unknown>
  const requiresAuth = Boolean(meta.requiresAuth)
  if (!requiresAuth) return

  const auth = await resolveClientAuthState(AUTH_WAIT_TIMEOUT_MS)

  if (!auth.isAuthenticated) {
    return navigateTo(`/auth?redirect=${encodeURIComponent(to.fullPath)}`)
  }

  const runtime = useRuntimeConfig()
  const roles = Array.isArray(meta.roles) ? meta.roles : []
  const needsDeveloper = roles.includes('developer')

  if (needsDeveloper) {
    const developerId = String(runtime.public?.fireux?.developerId || '').trim()
    if (!developerId || auth.uid !== developerId) {
      return navigateTo('/dashboard')
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
    timeoutMs: USER_WAIT_TIMEOUT_MS,
  })

  if (!isAdmin) {
    return navigateTo('/dashboard')
  }
})
