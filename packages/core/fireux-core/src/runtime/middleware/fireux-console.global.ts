import { defineNuxtRouteMiddleware, navigateTo, useCookie } from '#imports'
import { useAuth } from '../composables/fireux/firebase/useAuth'
import { useUser } from '../composables/fireux/firestore/core/user/useUser'
import {
  consoleFamilyFromPath,
  createDefaultRuntimeSelectionState,
  toConsoleFamilyPath,
  toConsoleSelectionStateKey,
} from '../composables/fireux/app/routing/consoleRoutes'
import { normalizeRuntimeMode } from '../composables/fireux/runtime/runtime.normalize'
import type { RuntimeSelectionState } from '../composables/fireux/runtime/runtime.types'

const AUTH_WAIT_TIMEOUT_MS = 2500
const USER_WAIT_TIMEOUT_MS = 1500

function isConsolePath(path: string) {
  return path === '/console' || path.startsWith('/console/')
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

function allowsGuestNonLiveConsole(path: string): boolean {
  const family = consoleFamilyFromPath(path)
  if (!family) return false

  const familyPath = toConsoleFamilyPath(family)
  if (path === `${familyPath}/create` || path.startsWith(`${familyPath}/create/`)) {
    return false
  }

  const cookie = useCookie<RuntimeSelectionState | null>(
    toConsoleSelectionStateKey(family),
    { default: createDefaultRuntimeSelectionState }
  )
  const mode = normalizeRuntimeMode(cookie.value?.mode, { defaultMode: 'demo' })
  return mode === 'demo'
}

function allowsGuestConsoleRoute(path: string): boolean {
  return /^\/console\/[^/]+\/demo(?:\/|$)/.test(path)
}

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  const path = String(to.path || '')
  if (!isConsolePath(path)) return

  const meta = to.meta as Record<string, unknown>
  const requiresAuth = Boolean(meta.requiresAuth)
  if (!requiresAuth) return

  const { isAuthenticated, hasAuthState } = useAuth()
  await waitFor(() => hasAuthState.value, AUTH_WAIT_TIMEOUT_MS)

  const allowsGuestConsole =
    allowsGuestConsoleRoute(path) || allowsGuestNonLiveConsole(path)

  if (!isAuthenticated.value) {
    if (allowsGuestConsole) return
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
