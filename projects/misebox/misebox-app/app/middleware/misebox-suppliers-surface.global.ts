// Keep the Supplier doorway focused without creating a second App authority.
import { defineNuxtRouteMiddleware, navigateTo, useRequestURL } from '#imports'
import type { RouteLocationNormalized } from 'vue-router'

const SUPPLIER_HOSTNAMES = new Set([
  'suppliers.misebox.app',
  'suppliers.localhost',
])

const SUPPLIER_PUBLIC_ROUTE = /^\/suppliers(?:\/|$)/

export default defineNuxtRouteMiddleware((to: RouteLocationNormalized) => {
  const hostname = useRequestURL().hostname.toLowerCase()
  if (!SUPPLIER_HOSTNAMES.has(hostname)) return

  if (to.path === '/') {
    return navigateTo('/suppliers', {
      redirectCode: 302,
      replace: true,
    })
  }

  if (SUPPLIER_PUBLIC_ROUTE.test(to.path)) {
    to.meta.layout = 'misebox-suppliers'
  }
})
