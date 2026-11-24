import {
  abortNavigation,
  createError,
  defineNuxtRouteMiddleware,
  navigateTo,
} from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import {
  workspaceFamilyFromRouteContext,
  normalizeWorkspaceFamily,
} from '../workspace/utils/routes'

// Resolve Workspace availability before the Core auth middleware runs.
export default defineNuxtRouteMiddleware((to) => {
  const path = String(to.path || '')
  if (path !== '/workspace' && !path.startsWith('/workspace/')) return
  to.meta.pageTransition = false
  if (path === '/workspace' || path === '/workspace/') return
  const config = useFireUXConfig()
  const family = workspaceFamilyFromRouteContext(path, to.meta.workspace)
  if (
    !family ||
    !config.workspaces.some(
      (value) => normalizeWorkspaceFamily(value) === family
    )
  )
    return navigateTo('/', { replace: true })
  if (
    Array.isArray(to.meta.roles) &&
    to.meta.roles.includes('developer') &&
    !import.meta.dev
  ) {
    return abortNavigation(
      createError({ statusCode: 404, statusMessage: 'Not found' })
    )
  }
})
