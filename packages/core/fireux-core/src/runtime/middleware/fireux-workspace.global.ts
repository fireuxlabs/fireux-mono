import {
  abortNavigation,
  createError,
  defineNuxtRouteMiddleware,
  navigateTo,
  useRuntimeConfig,
} from '#imports'
import {
  workspaceFamilyFromRouteContext,
  normalizeWorkspaceFamily,
  toWorkspaceFamilyPath,
} from '../composables/fireux/workspace/workspaceRoutes'
import {
  resolveClientAppAdmin,
  resolveClientAuthState,
} from '../utils/routeAuthGuard'

const AUTH_WAIT_TIMEOUT_MS = 2500
const USER_WAIT_TIMEOUT_MS = 1500

function isWorkspacePath(path: string) {
  return path === '/workspace' || path.startsWith('/workspace/')
}

function isWorkspaceRootPath(path: string) {
  return path === '/workspace' || path === '/workspace/'
}

export default defineNuxtRouteMiddleware(async (to) => {
  const path = String(to.path || '')
  if (!isWorkspacePath(path)) return
  to.meta.pageTransition = false
  if (import.meta.server) return
  const runtime = useRuntimeConfig()
  const fireuxRuntime = () =>
    (runtime.public?.fireux || {}) as Record<string, unknown>
  const appId = () => String(fireuxRuntime().id || '').trim()
  const databaseId = () =>
    String(runtime.public?.firebaseEcosystem?.firebase?.databaseId || '').trim()
  const workspaces = () =>
    Array.isArray(fireuxRuntime().workspaces)
      ? (fireuxRuntime().workspaces as unknown[])
      : []

  if (isWorkspaceRootPath(path)) {
    const firstFamily = Array.from(
      new Set(
        workspaces()
          .map((value) => normalizeWorkspaceFamily(value))
          .filter(Boolean)
      )
    )[0]

    return navigateTo(firstFamily ? toWorkspaceFamilyPath(firstFamily) : '/')
  }

  const enabledFamilies = new Set(
    workspaces()
      .map((value) => normalizeWorkspaceFamily(value))
      .filter(Boolean)
  )
  const routeFamily = workspaceFamilyFromRouteContext(path, to.query.family)

  if (!routeFamily || !enabledFamilies.has(routeFamily)) {
    return navigateTo('/', { replace: true })
  }

  const meta = to.meta as Record<string, unknown>
  const roles = Array.isArray(meta.roles) ? meta.roles : []
  const needsDeveloper = roles.includes('developer')

  if (needsDeveloper && !import.meta.dev) {
    return abortNavigation(
      createError({
        statusCode: 404,
        statusMessage: 'Not found',
      })
    )
  }

  const requiresAuth = Boolean(meta.requiresAuth)
  if (!requiresAuth) return

  const auth = await resolveClientAuthState(AUTH_WAIT_TIMEOUT_MS)

  if (!auth.isAuthenticated) {
    return navigateTo('/auth')
  }

  if (needsDeveloper) {
    const developerId = String(fireuxRuntime().developerId || '').trim()
    if (!developerId || auth.uid !== developerId) {
      return navigateTo('/dashboard')
    }
  }

  const needsAdmin = roles.includes('admin')
  if (!needsAdmin) return

  const isAdmin = await resolveClientAppAdmin({
    uid: auth.uid,
    appId: appId(),
    databaseId: databaseId(),
    timeoutMs: USER_WAIT_TIMEOUT_MS,
  })

  if (!isAdmin) {
    return navigateTo('/dashboard')
  }
})
