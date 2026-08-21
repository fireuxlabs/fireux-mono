import { getApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { fetchCurrentAppContext } from '../app/composables/currentAppContext'
import type { CurrentAppMembership } from '../app/models/app-context.model.ts'

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

type MembershipGuardOptions = AdminGuardOptions

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitForFirebaseApp(timeoutMs: number): Promise<FirebaseApp | null> {
  const deadline = Date.now() + timeoutMs
  while (!getApps().length && Date.now() < deadline) {
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

export async function resolveClientAuthState(
  timeoutMs: number
): Promise<AuthGuardState> {
  if (!import.meta.client) return { uid: null, isAuthenticated: false }

  const app = await waitForFirebaseApp(timeoutMs)
  if (!app) return { uid: null, isAuthenticated: false }

  const auth = getAuth(app)
  const currentUid = auth.currentUser?.uid ?? null
  if (currentUid) {
    return {
      uid: currentUid,
      isAuthenticated: !auth.currentUser?.isAnonymous,
    }
  }

  return withTimeout(
    new Promise<AuthGuardState>((resolve) => {
      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          unsubscribe()
          const uid = user?.uid ?? currentUid
          resolve({
            uid,
            isAuthenticated: Boolean(uid && !user?.isAnonymous),
          })
        },
        () => {
          unsubscribe()
          resolve({
            uid: currentUid,
            isAuthenticated: Boolean(currentUid && !auth.currentUser?.isAnonymous),
          })
        }
      )
    }),
    timeoutMs,
    {
      uid: currentUid,
      isAuthenticated: Boolean(currentUid && !auth.currentUser?.isAnonymous),
    }
  )
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

    const membership = await resolveCurrentAppMembership(app, uid, appId)
    return membership?.role === 'admin'
  }

  return withTimeout(run(), options.timeoutMs, false)
}

export async function resolveClientAppMember(
  options: MembershipGuardOptions
): Promise<boolean> {
  if (!import.meta.client) return false

  const uid = String(options.uid || '').trim()
  const appId = String(options.appId || '').trim()
  if (!uid || !appId) return false

  const run = async () => {
    const app = await waitForFirebaseApp(options.timeoutMs)
    if (!app) return false

    const membership = await resolveCurrentAppMembership(app, uid, appId)
    return membership !== null
  }

  return withTimeout(run(), options.timeoutMs, false)
}

async function resolveCurrentAppMembership(
  app: FirebaseApp,
  uid: string,
  appId: string
): Promise<CurrentAppMembership | null> {
  const user = getAuth(app).currentUser
  if (!user || user.uid !== uid) return null

  const context = await fetchCurrentAppContext(user)
  if (context.appId !== appId) {
    throw new Error(
      'Current App context does not match the route authority App.'
    )
  }

  return context.membership
}
