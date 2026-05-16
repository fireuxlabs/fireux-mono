import { getApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, getFirestore } from 'firebase/firestore'

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

  return withTimeout(
    new Promise<AuthGuardState>((resolve) => {
      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          unsubscribe()
          const uid = user?.uid ?? currentUid
          resolve({ uid, isAuthenticated: Boolean(uid) })
        },
        () => {
          unsubscribe()
          resolve({
            uid: currentUid,
            isAuthenticated: Boolean(currentUid),
          })
        }
      )
    }),
    timeoutMs,
    {
      uid: currentUid,
      isAuthenticated: Boolean(currentUid),
    }
  )
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
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

    const databaseId = String(options.databaseId || '').trim()
    const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app)

    const [coreUserResult, appUserResult, appResult] = await Promise.allSettled([
      getDoc(doc(db, 'users', uid)),
      getDoc(doc(db, 'apps', appId, 'users', uid)),
      getDoc(doc(db, 'apps', appId)),
    ])

    const appUser =
      appUserResult.status === 'fulfilled' && appUserResult.value.exists()
        ? appUserResult.value.data()
        : null
    if (appUser?.role === 'admin') return true

    const coreUser =
      coreUserResult.status === 'fulfilled' && coreUserResult.value.exists()
        ? coreUserResult.value.data()
        : null
    if (stringArray(coreUser?.adminOf).includes(appId)) return true

    const appDoc =
      appResult.status === 'fulfilled' && appResult.value.exists()
        ? appResult.value.data()
        : null
    return stringArray(appDoc?.admin_ids).includes(uid)
  }

  return withTimeout(run(), options.timeoutMs, false)
}
