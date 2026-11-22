import { defineNuxtRouteMiddleware } from '#imports'
import { enforceClientRouteAuth } from '../composables/navigation/route-auth'

export default defineNuxtRouteMiddleware((to) => {
  // Diagnostics enforces its own developer-only policy.
  if (to.path === '/diagnostics' || to.path.startsWith('/diagnostics/')) return
  return enforceClientRouteAuth(to)
})
