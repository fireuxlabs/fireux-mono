import { defineNuxtRouteMiddleware, navigateTo } from '#imports'
import { useAuth } from '../composables/fireux/firebase/useAuth'
import { useUser } from '../composables/fireux/firestore/core/user/useUser'

const AUTH_WAIT_TIMEOUT_MS = 2500
const ADMIN_WAIT_TIMEOUT_MS = 1500

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
  const authDeadline = Date.now() + AUTH_WAIT_TIMEOUT_MS

  while (!hasAuthState.value && Date.now() < authDeadline) {
    await sleep(50)
  }

  if (!isAuthenticated.value) {
    return navigateTo(`/auth?redirect=${encodeURIComponent(to.fullPath)}`)
  }

  const roles = asRoles((to.meta as Record<string, unknown>)?.roles)
  if (!roles.includes('admin')) return

  const { isAdmin, isResolved } = useUser()
  const adminDeadline = Date.now() + ADMIN_WAIT_TIMEOUT_MS

  while (!isResolved.value && Date.now() < adminDeadline) {
    await sleep(50)
  }

  if (!isAdmin.value) {
    return navigateTo('/dashboard')
  }
})
