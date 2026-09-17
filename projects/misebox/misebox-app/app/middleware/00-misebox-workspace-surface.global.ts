import { defineNuxtRouteMiddleware, navigateTo, useRequestURL } from '#imports'
import type { RouteLocationNormalized } from 'vue-router'

// App-owned host composition, matching the existing Jobs hostname doorway.
// Workspace permissions and enabled families remain with Core and the domain.
export default defineNuxtRouteMiddleware((to: RouteLocationNormalized) => {
  const requestUrl = useRequestURL()
  const hostname = requestUrl.hostname.toLowerCase()
  const workspaceHost =
    hostname === 'workspace.misebox.app' || hostname === 'workspace.localhost'
  if (workspaceHost && to.path === '/') {
    return navigateTo(
      { path: '/workspace/kitchen', query: to.query, hash: to.hash },
      { redirectCode: 302, replace: true }
    )
  }
  if (
    (hostname === 'misebox.app' ||
      hostname === 'www.misebox.app' ||
      hostname === 'localhost') &&
    (to.path === '/workspace' || to.path.startsWith('/workspace/'))
  ) {
    const workspaceOrigin =
      hostname === 'localhost'
        ? `${requestUrl.protocol}//workspace.localhost${requestUrl.port ? `:${requestUrl.port}` : ''}`
        : 'https://workspace.misebox.app'
    return navigateTo(`${workspaceOrigin}${to.fullPath}`, {
      external: true,
      redirectCode: 302,
    })
  }
})
