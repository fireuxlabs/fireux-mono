import { defineNuxtRouteMiddleware, navigateTo, useRequestURL } from '#imports'
import type { RouteLocationNormalized } from 'vue-router'

// App-owned host composition, matching the existing Jobs hostname doorway.
// Workspace permissions and enabled families remain with Core and the domain.
export default defineNuxtRouteMiddleware((to: RouteLocationNormalized) => {
  const hostname = useRequestURL().hostname.toLowerCase()
  const workspaceHost =
    hostname === 'workspace.fireux.app' ||
    hostname === 'workspace.fireux.localhost'
  if (workspaceHost && to.path === '/') {
    return navigateTo(
      { path: '/workspace/project', query: to.query, hash: to.hash },
      { redirectCode: 302, replace: true }
    )
  }
})
