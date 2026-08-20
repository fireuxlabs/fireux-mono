// Retire the former Misebox Supplier product doorway. Bringli owns Supplier
// onboarding, identity, catalogue and Workspace surfaces; Misebox retains only
// Kitchen-side sourcing and procurement.
import { defineNuxtRouteMiddleware, navigateTo, useRequestURL } from '#imports'
import type { RouteLocationNormalized } from 'vue-router'

const SUPPLIER_HOSTNAMES = new Set([
  'suppliers.misebox.app',
  'suppliers.localhost',
])

export default defineNuxtRouteMiddleware((to: RouteLocationNormalized) => {
  const hostname = useRequestURL().hostname.toLowerCase()
  if (!SUPPLIER_HOSTNAMES.has(hostname)) return

  const path = to.path === '/' ? '/' : to.fullPath
  return navigateTo(`https://bringli.app${path}`, {
    external: true,
    redirectCode: 308,
    replace: true,
  })
})
