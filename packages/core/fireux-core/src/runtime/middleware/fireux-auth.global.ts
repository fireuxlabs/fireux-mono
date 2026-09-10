// Concurrent edit — 2026-07-20 23:29 CEST — Profile auth hydration fix: defer initial protected-route redirects through Nuxt readiness.
import {
  defineNuxtRouteMiddleware,
  navigateTo,
  onNuxtReady,
  useNuxtApp,
  useRouter,
  useRuntimeConfig,
} from '#imports'
import {
  resolveClientAppAdmin,
  resolveClientAuthState,
} from '../utils/routeAuthGuard'

const AUTH_WAIT_TIMEOUT_MS = 2500

function isWorkspacePath(path: string) {
  return path === '/workspace' || path.startsWith('/workspace/')
}

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return
  const router = useRouter()

  const path = String(to.path || '')
  if (isWorkspacePath(path)) return

  if (path === '/auth' && 'redirect' in to.query) {
    const query = { ...to.query }
    delete query.redirect
    return navigateTo({ path: '/auth', query }, { replace: true })
  }

  const meta = to.meta as Record<string, unknown>
  const requiresAuth = Boolean(meta.requiresAuth)
  if (!requiresAuth) return

  const nuxtApp = useNuxtApp()
  const runtime = useRuntimeConfig()
  const redirectTo = (path: string) =>
    nuxtApp.runWithContext(() => navigateTo(path))

  const enforceAuth = async () => {
    const auth = await resolveClientAuthState(AUTH_WAIT_TIMEOUT_MS)

    if (!auth.isAuthenticated) {
      return redirectTo('/auth')
    }

    const roles = Array.isArray(meta.roles) ? meta.roles : []
    const needsDeveloper = roles.includes('developer')

    if (needsDeveloper) {
      const developerId = String(
        runtime.public?.fireux?.developerId || ''
      ).trim()
      if (!developerId || auth.uid !== developerId) {
        return redirectTo('/dashboard')
      }
    }

    const needsAdmin = roles.includes('admin')
    if (!needsAdmin) return

    const appId = String(runtime.public?.fireux?.id || '').trim()
    const databaseId = String(
      runtime.public?.firebaseEcosystem?.firebase?.databaseId || ''
    ).trim()
    const isAdmin = await resolveClientAppAdmin({
      uid: auth.uid,
      appId,
      databaseId,
      timeoutMs: 1500,
    })

    if (!isAdmin) {
      return redirectTo('/dashboard')
    }
  }

  if (nuxtApp.isHydrating) {
    const guardedPath = to.fullPath
    onNuxtReady(() => {
      if (router.currentRoute.value.fullPath !== guardedPath) return
      void enforceAuth()
    })
    return
  }

  return enforceAuth()
})
