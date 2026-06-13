import { defineNuxtRouteMiddleware, navigateTo, useRuntimeConfig } from '#imports'
import {
  consoleFamilyFromPath,
  normalizeConsoleFamily,
  toConsoleFamilyPath,
} from '../composables/fireux/app/routing/consoleRoutes'
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

function isConsoleRootPath(path: string) {
  return path === '/console' || path === '/console/'
}

function membershipMode(fireuxRuntime: Record<string, unknown>) {
  const explicit = String(fireuxRuntime.membership || '').trim()
  if (explicit === 'open' || explicit === 'restricted') return explicit

  return String(fireuxRuntime.role || '').trim() === 'tenant'
    ? 'restricted'
    : 'open'
}

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  const path = String(to.path || '')
  if (!isConsolePath(path)) return
  const runtime = useRuntimeConfig()
  const fireuxRuntime = () =>
    (runtime.public?.fireux || {}) as Record<string, unknown>
  const appId = () => String(fireuxRuntime().id || '').trim()
  const databaseId = () =>
    String(runtime.public?.firebaseEcosystem?.firebase?.databaseId || '').trim()
  const consoles = () =>
    Array.isArray(fireuxRuntime().consoles)
      ? (fireuxRuntime().consoles as unknown[])
      : []

  if (isConsoleRootPath(path)) {
    const firstFamily = Array.from(
      new Set(
        consoles()
          .map((value) => normalizeConsoleFamily(value))
          .filter(Boolean)
      )
    )[0]

    return navigateTo(firstFamily ? toConsoleFamilyPath(firstFamily) : '/')
  }

  const enabledFamilies = new Set(
    consoles()
      .map((value) => normalizeConsoleFamily(value))
      .filter(Boolean)
  )
  const routeFamily = consoleFamilyFromPath(path)

  if (!routeFamily || !enabledFamilies.has(routeFamily)) {
    return navigateTo('/', { replace: true })
  }

  const meta = to.meta as Record<string, unknown>
  const requiresAuth = Boolean(meta.requiresAuth)
  if (!requiresAuth) return

  const auth = await resolveClientAuthState(AUTH_WAIT_TIMEOUT_MS)

  if (!auth.isAuthenticated) {
    return navigateTo(`/auth?redirect=${encodeURIComponent(to.fullPath)}`)
  }

  if (membershipMode(fireuxRuntime()) === 'restricted') {
    const isMember = await resolveClientAppMember({
      uid: auth.uid,
      appId: appId(),
      databaseId: databaseId(),
      timeoutMs: USER_WAIT_TIMEOUT_MS,
    })

    if (!isMember) {
      return navigateTo('/')
    }
  }

  const needsAdmin = Array.isArray(meta.roles) && meta.roles.includes('admin')
  if (!needsAdmin) return

  const isAdmin = await resolveClientAppAdmin({
    uid: auth.uid,
    appId: appId(),
    databaseId: databaseId(),
    timeoutMs: USER_WAIT_TIMEOUT_MS,
  })

  if (!isAdmin) {
    return navigateTo('/dashboard')
  }
})
