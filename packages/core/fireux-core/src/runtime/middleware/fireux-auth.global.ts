import { defineNuxtRouteMiddleware, navigateTo, useRuntimeConfig } from '#imports'
import {
  resolveClientAppAdmin,
  resolveClientAppMember,
  resolveClientAuthState,
} from '../utils/routeAuthGuard'

const AUTH_WAIT_TIMEOUT_MS = 2500
const USER_WAIT_TIMEOUT_MS = 1500

function isConsolePath(path: string) {
  return path === '/console' || path.startsWith('/console/')
}

function membershipMode(runtime: ReturnType<typeof useRuntimeConfig>) {
  const fireux = (runtime.public?.fireux || {}) as Record<string, unknown>
  const explicit = String(fireux.membership || '').trim()
  if (explicit === 'open' || explicit === 'restricted') return explicit

  return String(fireux.role || '').trim() === 'tenant' ? 'restricted' : 'open'
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
  const appId = String(runtime.public?.fireux?.id || '').trim()
  const databaseId = String(
    runtime.public?.firebaseEcosystem?.firebase?.databaseId || ''
  ).trim()

  if (membershipMode(runtime) === 'restricted') {
    const isMember = await resolveClientAppMember({
      uid: auth.uid,
      appId,
      databaseId,
      timeoutMs: USER_WAIT_TIMEOUT_MS,
    })

    if (!isMember) {
      return navigateTo('/')
    }
  }

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
