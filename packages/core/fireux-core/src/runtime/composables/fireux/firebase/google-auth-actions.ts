import { getApps } from 'firebase/app'
import {
  getAuth,
  getRedirectResult,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  type Auth,
  type User,
} from 'firebase/auth'
import type { Ref } from 'vue'
import {
  clearPendingAccountConsent,
  readPendingAccountConsent,
  rememberPendingAccountConsent,
} from './account-consent'

type EnsureSignedInUser = (
  user: User | null,
  termsVersion?: string
) => Promise<User | null>

let signInFlight: Promise<User | null> | null = null
let redirectResultFlight: Promise<User | null> | null = null

export async function resolveGoogleRedirectAuthResult(
  auth: Ref<Auth | null>,
  ensureSignedInUser: EnsureSignedInUser
) {
  if (!import.meta.client) return null
  const authInstance = auth.value || (getApps().length ? getAuth() : null)
  if (!authInstance) return null
  if (redirectResultFlight) return redirectResultFlight

  redirectResultFlight = (async () => {
    let result
    try {
      result = await getRedirectResult(authInstance)
    } catch {
      clearPendingAccountConsent()
      return authInstance.currentUser ?? null
    }
    if (!result?.user) {
      return ensureSignedInUser(authInstance.currentUser ?? null)
    }
    return ensureSignedInUser(
      result.user,
      readPendingAccountConsent() ?? undefined
    )
  })()
  try {
    return await redirectResultFlight
  } finally {
    redirectResultFlight = null
  }
}

export async function signInWithGoogleAuth(
  auth: Ref<Auth | null>,
  termsVersion: string | undefined,
  ensureSignedInUser: EnsureSignedInUser
) {
  if (termsVersion) rememberPendingAccountConsent(termsVersion)
  else clearPendingAccountConsent()
  if (signInFlight) return signInFlight
  const run = async () => {
    if (!auth.value) {
      clearPendingAccountConsent()
      return null
    }
    const provider = new GoogleAuthProvider()
    let result
    try {
      result = await signInWithPopup(auth.value, provider)
    } catch (error) {
      const code =
        typeof error === 'object' && error !== null && 'code' in error
          ? String((error as { code?: unknown }).code ?? '')
          : ''
      if (
        code === 'auth/popup-blocked' ||
        code === 'auth/cancelled-popup-request'
      ) {
        try {
          await signInWithRedirect(auth.value, provider)
        } catch {
          clearPendingAccountConsent()
        }
        return null
      }
      clearPendingAccountConsent()
      return null
    }
    return ensureSignedInUser(result.user, termsVersion)
  }
  signInFlight = run()
  try {
    return await signInFlight
  } finally {
    signInFlight = null
  }
}
