import { defineNuxtRouteMiddleware, navigateTo } from '#imports'
import { useRuntimeProjectSelection } from '../composables/fireux/app/runtime-project'
import { useAuth } from '../composables/fireux/firebase/useAuth'
import { useUser } from '../composables/fireux/firestore/core/user/useUser'

const AUTH_WAIT_TIMEOUT_MS = 2500
const USER_WAIT_TIMEOUT_MS = 1500

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

  const meta = to.meta as Record<string, unknown>
  const requiresAuth = Boolean(meta.requiresAuth)
  if (!requiresAuth) return

  const { isAuthenticated, hasAuthState } = useAuth()
  const projectSelection = useRuntimeProjectSelection()
  await waitFor(() => hasAuthState.value, AUTH_WAIT_TIMEOUT_MS)

  const allowsGuestProjectConsole =
    String(to.path || '').startsWith('/console/projects') &&
    projectSelection.runtimeProjectMode.value !== 'live'

  if (!isAuthenticated.value) {
    if (allowsGuestProjectConsole) return
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
