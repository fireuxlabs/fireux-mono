import {
  createError,
  defineNuxtRouteMiddleware,
  navigateTo,
  useRequestURL,
  useRuntimeConfig,
} from '#imports'
import type { RouteLocationNormalized } from 'vue-router'

// The Main App owns its public and Workspace origins; domain authority is unchanged.
export default defineNuxtRouteMiddleware((to: RouteLocationNormalized) => {
  const requestUrl = useRequestURL()
  const hostname = requestUrl.hostname.toLowerCase()
  if (to.path === '/') {
    const workspaceOrigin = useRuntimeConfig().public.fireux.workspaceConfig?.kitchen?.origin
    const workspaceHost = requestUrl.origin === workspaceOrigin
    to.meta.layout = workspaceHost ? 'workspace' : 'landing'
    to.meta.workspace = workspaceHost ? 'kitchen' : undefined
    to.meta.workspaceSurface = workspaceHost ? 'browse' : undefined
    return
  }
  // Retired homes are absent from the route table, without compatibility redirects.
  if (['/workspace', '/workspace/', '/workspace/kitchen', '/workspace/kitchen/'].includes(to.path)) {
    throw createError({ statusCode: 404, statusMessage: 'Page not found' })
  }
  if (!to.path.startsWith('/workspace/')) return

  const localPublicHost = ['localhost', '127.0.0.1', '[::1]'].includes(hostname)
  const mainPublicHost = [
    'misebox.app',
    'www.misebox.app',
    'misebox-78f9c.web.app',
    'misebox-78f9c.firebaseapp.com',
  ].includes(hostname)
  if (!localPublicHost && !mainPublicHost) return

  const destination = new URL(to.fullPath, requestUrl)
  destination.hostname = localPublicHost ? 'workspace.localhost' : 'workspace.misebox.app'
  if (mainPublicHost) {
    destination.protocol = 'https:'
    destination.port = ''
  }
  return navigateTo(destination.href, {
    external: true,
    redirectCode: 302,
    replace: true,
  })
})
