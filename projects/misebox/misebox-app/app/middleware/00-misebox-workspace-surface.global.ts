import { defineNuxtRouteMiddleware, navigateTo, useRequestURL } from '#imports'
import type { RouteLocationNormalized } from 'vue-router'

// App-owned host composition, matching the existing Jobs hostname doorway.
// Workspace permissions and enabled families remain with Core and the domain.
export default defineNuxtRouteMiddleware((to: RouteLocationNormalized) => {
  const hostname = useRequestURL().hostname.toLowerCase()
  const workspaceHost =
    hostname === 'workspace.misebox.app' || hostname === 'workspace.localhost'
  if (workspaceHost && to.path === '/') {
    return navigateTo('/workspace/kitchen', {
      redirectCode: 302,
      replace: true,
    })
  }
  if (
    (hostname === 'misebox.app' || hostname === 'www.misebox.app') &&
    (to.path === '/workspace' || to.path.startsWith('/workspace/'))
  ) {
    return navigateTo(`https://workspace.misebox.app${to.fullPath}`, {
      external: true,
      redirectCode: 302,
    })
  }
})
