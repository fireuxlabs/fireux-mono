import {
  GoogleAuthProvider,
  signInWithPopup,
  type Auth,
  type User,
} from 'firebase/auth'
import type { Ref } from 'vue'
import {
  clearPendingAccountConsent,
  rememberPendingAccountConsent,
} from './account-consent'

type EnsureSignedInUser = (
  user: User | null,
  termsVersion?: string
) => Promise<User | null>

let signInFlight: Promise<User | null> | null = null
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
      clearPendingAccountConsent()
      throw error
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
