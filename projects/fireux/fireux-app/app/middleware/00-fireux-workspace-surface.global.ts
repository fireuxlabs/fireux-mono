import { defineNuxtRouteMiddleware, navigateTo, useRequestURL } from '#imports'
import type { RouteLocationNormalized } from 'vue-router'

// App-owned host composition, matching the existing Jobs hostname doorway.
// Workspace permissions and enabled families remain with Core and the domain.
export default defineNuxtRouteMiddleware((to: RouteLocationNormalized) => {
  const hostname = useRequestURL().hostname.toLowerCase()
  const workspaceHost =
    hostname === 'workspace.fireux.app' ||
    hostname === 'workspace.fireux.localhost'
  const mainHost =
    hostname === 'fireux.app' ||
    hostname === 'www.fireux.app' ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1'
  if ((workspaceHost || mainHost) && to.path === '/') {
    return navigateTo(
      { path: '/workspace/project', query: to.query, hash: to.hash },
      { redirectCode: 302, replace: true }
    )
  }
})
