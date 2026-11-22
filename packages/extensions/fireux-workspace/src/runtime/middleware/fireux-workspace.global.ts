import {
  abortNavigation,
  createError,
  defineNuxtRouteMiddleware,
  navigateTo,
  useRouter,
} from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import {
  workspaceFamilyFromRouteContext,
  normalizeWorkspaceFamily,
} from '../workspace/utils/routes'
import { useWorkspaceEntryCta } from '../workspace/composables/useWorkspaceEntryCta'

// Resolve Workspace availability before the Core auth middleware runs.
export default defineNuxtRouteMiddleware((to) => {
  const path = String(to.path || '')
  if (path !== '/workspace' && !path.startsWith('/workspace/')) return
  to.meta.pageTransition = false
  if (path === '/workspace' || path === '/workspace/') {
    // Do not recreate an entrance that the App deliberately removed.
    if (
      !useRouter()
        .getRoutes()
        .some((route) => route.path === '/workspace')
    )
      return
    const { openWorkspace } = useWorkspaceEntryCta()
    return openWorkspace({}, { replace: true })
  }
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
