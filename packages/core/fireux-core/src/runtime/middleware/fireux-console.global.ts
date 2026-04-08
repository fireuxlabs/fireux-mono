import { defineNuxtRouteMiddleware, navigateTo } from '#imports'
import { useFireUXConfig } from '../composables/fireux/app/FireUXConfig'
import {
  normalizeConsoleFamily,
  toConsoleFamilyPath,
} from '../composables/fireux/app/routing/consoleRoutes'
import { useAuth } from '../composables/fireux/firebase/useAuth'
import { useUser } from '../composables/fireux/firestore/core/user/useUser'

const AUTH_WAIT_TIMEOUT_MS = 2500
const USER_WAIT_TIMEOUT_MS = 1500

function isConsolePath(path: string) {
  return path === '/console' || path.startsWith('/console/')
}

function isConsoleRootPath(path: string) {
  return path === '/console' || path === '/console/'
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitFor(ready: () => boolean, timeoutMs: number) {
  const deadline = Date.now() + timeoutMs
  while (!ready() && Date.now() < deadline) {
    await sleep(50)
  }
}

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  const path = String(to.path || '')
  if (!isConsolePath(path)) return

  if (isConsoleRootPath(path)) {
    const { consoleFamilies } = useFireUXConfig()
    const firstFamily = Array.from(
      new Set(
        (consoleFamilies || [])
          .map((value) => normalizeConsoleFamily(value))
          .filter(Boolean)
      )
    )[0]

    return navigateTo(firstFamily ? toConsoleFamilyPath(firstFamily) : '/')
  }

  const meta = to.meta as Record<string, unknown>
  const requiresAuth = Boolean(meta.requiresAuth)
  if (!requiresAuth) return

  const { isAuthenticated, hasAuthState } = useAuth()
  await waitFor(() => hasAuthState.value, AUTH_WAIT_TIMEOUT_MS)

  if (!isAuthenticated.value) {
    return navigateTo(`/auth?redirect=${encodeURIComponent(to.fullPath)}`)
  }

  const needsAdmin = Array.isArray(meta.roles) && meta.roles.includes('admin')
  if (!needsAdmin) return

  const { isAdmin, isResolved } = useUser()
  await waitFor(() => isResolved.value, USER_WAIT_TIMEOUT_MS)

  if (!isAdmin.value) {
    return navigateTo('/dashboard')
  }
})
