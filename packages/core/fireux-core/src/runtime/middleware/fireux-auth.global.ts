import { defineNuxtRouteMiddleware, navigateTo, useCookie } from '#imports'
import { useAuth } from '../composables/fireux/firebase/useAuth'
import { useUser } from '../composables/fireux/firestore/core/user/useUser'
import { normalizeRuntimeMode } from '../composables/fireux/runtime/runtime.normalize'

const AUTH_WAIT_TIMEOUT_MS = 2500
const USER_WAIT_TIMEOUT_MS = 1500
const CONSOLE_RUNTIME_COOKIES = [
  { prefix: '/console/kitchen', cookieKey: 'fireux_runtime_kitchen' },
  { prefix: '/console/portfolio', cookieKey: 'fireux_runtime_portfolio' },
  { prefix: '/console/supplier', cookieKey: 'fireux_runtime_supplier' },
  { prefix: '/console/projects', cookieKey: 'fireux_runtime_project' },
] as const

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
  for (const entry of CONSOLE_RUNTIME_COOKIES) {
    if (!path.startsWith(entry.prefix)) continue
    if (path === `${entry.prefix}/create` || path.startsWith(`${entry.prefix}/create/`)) {
      return false
    }

    const cookie = useCookie<Record<string, unknown> | null>(entry.cookieKey)
    const mode = normalizeRuntimeMode(cookie.value?.mode, { defaultMode: 'live' })
    return mode !== 'live'
  }

  return false
}

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  const meta = to.meta as Record<string, unknown>
  const requiresAuth = Boolean(meta.requiresAuth)
  if (!requiresAuth) return

  const { isAuthenticated, hasAuthState } = useAuth()
  await waitFor(() => hasAuthState.value, AUTH_WAIT_TIMEOUT_MS)
  const allowsGuestConsole = allowsGuestNonLiveConsole(String(to.path || ''))

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
