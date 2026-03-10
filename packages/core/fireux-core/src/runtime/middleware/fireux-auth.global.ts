import { defineNuxtRouteMiddleware, navigateTo, useRouter } from '#imports'
import { useRuntimeProjectSelection } from '../composables/fireux/app/runtime-project'
import { useAuth } from '../composables/fireux/firebase/useAuth'
import { useUser } from '../composables/fireux/firestore/core/user/useUser'
import {
  discoverConsoleChildren,
  getConsoleScopeFromPath,
  isConsoleRoutePath,
} from '../composables/fireux/app/routing/consoleRoutes'
import {
  resolveConsoleAccessDecision,
} from '../composables/fireux/app/routing/useConsoleAccess'

const AUTH_WAIT_TIMEOUT_MS = 2500
const USER_WAIT_TIMEOUT_MS = 1500

function asRoles(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((entry) => String(entry ?? '').trim().toLowerCase())
    .filter(Boolean)
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  const requiresAuth = Boolean(
    (to.meta as Record<string, unknown>)?.requiresAuth
  )
  if (!requiresAuth) return

  const { isAuthenticated, hasAuthState } = useAuth()
  const projectSelection = useRuntimeProjectSelection()
  const authDeadline = Date.now() + AUTH_WAIT_TIMEOUT_MS

  while (!hasAuthState.value && Date.now() < authDeadline) {
    await sleep(50)
  }

  const allowsGuestProjectConsole =
    String(to.path || '').startsWith('/console/projects') &&
    projectSelection.runtimeProjectMode.value !== 'live'

  if (!isAuthenticated.value) {
    if (allowsGuestProjectConsole) return
    return navigateTo(`/auth?redirect=${encodeURIComponent(to.fullPath)}`)
  }

  const router = useRouter()
  const isConsoleRoute = isConsoleRoutePath(to.path)
  const roles = asRoles((to.meta as Record<string, unknown>)?.roles)
  const needsUserResolution = isConsoleRoute || roles.includes('admin')
  if (!needsUserResolution) return

  const { appUser, isAdmin, isResolved } = useUser()
  const userDeadline = Date.now() + USER_WAIT_TIMEOUT_MS

  while (!isResolved.value && Date.now() < userDeadline) {
    await sleep(50)
  }

  if (isConsoleRoute) {
    const consoleChildren = discoverConsoleChildren(router.getRoutes())
    const decision = resolveConsoleAccessDecision({
      isAuthenticated: isAuthenticated.value,
      appUser: appUser.value,
      isAdmin: isAdmin.value,
      discoveredChildren: consoleChildren,
      requestedScope: getConsoleScopeFromPath(to.path),
    })

    if (decision.status === 'disabled') {
      const hasPricingUsers = router.getRoutes().some((route) => route.path === '/pricing/users')
      const hasPricing = router.getRoutes().some((route) => route.path === '/pricing')
      return navigateTo(hasPricingUsers ? '/pricing/users' : hasPricing ? '/pricing' : '/dashboard')
    }

    if (decision.status === 'forbidden') {
      const hasConsoleRoot = router.getRoutes().some((route) => route.path === '/console')
      const fallbackPath = hasConsoleRoot
        ? '/console'
        : decision.firstAllowedChild?.path || '/dashboard'
      return navigateTo(fallbackPath)
    }
  }

  if (roles.includes('admin') && !isAdmin.value) {
    return navigateTo('/dashboard')
  }
})
