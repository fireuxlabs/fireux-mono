import {
  navigateTo,
  onNuxtReady,
  showError,
  useNuxtApp,
  useRouter,
  useRuntimeConfig,
} from '#imports'
import type { RouteLocationNormalized } from 'vue-router'
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'
import { authRedirectPath } from '../../user/utils/auth-redirect'
import { watch } from 'vue'
import { getApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, getFirestore } from 'firebase/firestore'
import type { AppUserWithId } from '../../app/app-user/types.ts'

type AuthGuardState = {
  uid: string | null
  isAuthenticated: boolean
}

type AdminGuardOptions = {
  uid: string | null | undefined
  appId: string | null | undefined
  databaseId?: string | null | undefined
  timeoutMs: number
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitForFirebaseApp(
  timeoutMs: number,
  signal?: AbortSignal
): Promise<FirebaseApp | null> {
  const deadline = Date.now() + timeoutMs
  while (!getApps().length && Date.now() < deadline) {
    signal?.throwIfAborted()
    await sleep(50)
  }

  return getApps().length ? getApp() : null
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, fallback: T) {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => {
      setTimeout(() => resolve(fallback), timeoutMs)
    }),
  ])
}

// One route check owns its listener; navigation disposes unresolved work.
export function createClientRouteCheck(readPath: () => string) {
  const controller = new AbortController()
  const stop = watch(readPath, () => controller.abort(), { flush: 'sync' })
  return {
    signal: controller.signal,
    dispose() {
      stop()
      controller.abort()
    },
  }
}

export async function resolveClientAuthState(
  timeoutMs: number,
  signal?: AbortSignal
): Promise<AuthGuardState> {
  if (!import.meta.client) return { uid: null, isAuthenticated: false }
  signal?.throwIfAborted()
  const app = await waitForFirebaseApp(timeoutMs, signal)
  signal?.throwIfAborted()
  if (!app) throw new Error('Sign-in is not available. Please try again.')

  const auth = getAuth(app)
  // A null currentUser may mean Firebase has not restored the session yet.
  // Only its settled callback proves that this visitor is signed out.
  return new Promise<AuthGuardState>((resolve, reject) => {
    let unsubscribe: (() => void) | undefined
    let finished = false
    const cleanup = () => {
      unsubscribe?.()
      signal?.removeEventListener('abort', cancel)
    }
    const cancel = () => {
      if (finished) return
      finished = true
      cleanup()
      reject(signal?.reason)
    }
    signal?.addEventListener('abort', cancel, { once: true })
    unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (finished) return
        finished = true
        cleanup()
        resolve({
          uid: user?.uid ?? null,
          isAuthenticated: Boolean(user && !user.isAnonymous),
        })
      },
      () => {
        if (finished) return
        finished = true
        cleanup()
        reject(
          new Error('Your sign-in could not be checked. Please try again.')
        )
      }
    )
    // Also handles an immediately delivered initial callback.
    if (finished) cleanup()
  })
}

export async function resolveClientAppAdmin(
  options: AdminGuardOptions
): Promise<boolean> {
  if (!import.meta.client) return false

  const uid = String(options.uid || '').trim()
  const appId = String(options.appId || '').trim()
  if (!uid || !appId) return false

  const run = async () => {
    const app = await waitForFirebaseApp(options.timeoutMs)
    if (!app) return false

    const membership = await readAppUser(app, uid, appId, options.databaseId)
    return membership?.role === 'admin' || membership?.role === 'dev'
  }

  return withTimeout(run(), options.timeoutMs, false)
}

async function readAppUser(
  app: FirebaseApp,
  uid: string,
  appId: string,
  databaseId?: string | null
): Promise<AppUserWithId | null> {
  const user = getAuth(app).currentUser
  if (!user || user.uid !== uid) return null
  const db = getFirestore(app, String(databaseId || '(default)'))
  const snapshot = await getDoc(doc(db, 'apps', appId, 'users', uid))
  return snapshot.exists()
    ? ({ id: snapshot.id, ...snapshot.data() } as AppUserWithId)
    : null
}

type RouteAuthPolicy = { requiresAuth?: boolean; roles?: readonly string[] }

/** Shared client navigation decision; server commands retain their own authority. */
export function enforceClientRouteAuth(
  to: Pick<RouteLocationNormalized, 'fullPath' | 'meta'>,
  policy: RouteAuthPolicy = {}
) {
  if (import.meta.server || !(policy.requiresAuth ?? to.meta.requiresAuth))
    return
  const roles: readonly unknown[] =
    policy.roles ?? (Array.isArray(to.meta.roles) ? to.meta.roles : [])
  const nuxtApp = useNuxtApp()
  const router = useRouter()
  const runtime = useRuntimeConfig()
  const config = useFireUXConfig()
  const redirect = (path: string) =>
    nuxtApp.runWithContext(() => navigateTo(path))
  const enforce = async () => {
    const check = createClientRouteCheck(
      () => router.currentRoute.value.fullPath
    )
    try {
      const auth = await resolveClientAuthState(2500, check.signal)
      if (check.signal.aborted) return
      if (!auth.isAuthenticated) return redirect(authRedirectPath(to.fullPath))
      if (
        roles.includes('developer') &&
        (!config.developerId || auth.uid !== config.developerId)
      )
        return redirect('/dashboard')
      if (!roles.includes('admin')) return
      const isAdmin = await resolveClientAppAdmin({
        uid: auth.uid,
        appId: config.appId,
        databaseId: runtime.public.firebaseEcosystem?.firebase?.databaseId,
        timeoutMs: 1500,
      })
      if (!check.signal.aborted && !isAdmin) return redirect('/dashboard')
    } catch (error) {
      if (!check.signal.aborted) throw error
    } finally {
      check.dispose()
    }
  }
  if (nuxtApp.isHydrating) {
    const guardedPath = to.fullPath
    onNuxtReady(() => {
      if (router.currentRoute.value.fullPath !== guardedPath) return
      void enforce().catch((error) =>
        nuxtApp.runWithContext(() => showError(error))
      )
    })
    return
  }
  return enforce()
}
