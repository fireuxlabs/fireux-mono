import { defineNuxtRouteMiddleware } from '#imports'
import { enforceClientRouteAuth } from '../composables/navigation/route-auth'

export default defineNuxtRouteMiddleware((to) => {
  // These scopes check availability before delegating to the same auth owner.
  if (
    ['/workspace', '/diagnostics'].some(
      (root) => to.path === root || to.path.startsWith(`${root}/`)
    )
  )
    return
  return enforceClientRouteAuth(to)
})
