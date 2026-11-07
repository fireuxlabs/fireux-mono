import {
  GoogleAuthProvider,
  signInWithPopup,
  type Auth,
  type User,
} from 'firebase/auth'
import type { Ref } from 'vue'
type EnsureSignedInUser = (user: User | null) => Promise<User | null>

let signInFlight: Promise<User | null> | null = null
export async function signInWithGoogleAuth(
  auth: Ref<Auth | null>,
  ensureSignedInUser: EnsureSignedInUser
) {
  if (signInFlight) return signInFlight
  const run = async () => {
    if (!auth.value) {
      return null
    }
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth.value, provider)
    return ensureSignedInUser(result.user)
  }
  signInFlight = run()
  try {
    return await signInFlight
  } finally {
    signInFlight = null
  }
}
