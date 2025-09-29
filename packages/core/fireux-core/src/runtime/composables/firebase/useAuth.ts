// ~/composables/useAuth.ts
import { computed, ref } from 'vue'
import { useFirebaseAuth, useCurrentUser } from 'vuefire'
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
} from 'firebase/auth'

// Unified ensure to avoid spinning up reactive docs here
import { useUserEnsure } from '../firestore/user/useUserEnsure'
import { useFireUXConfig } from '../FireUXConfig'

export function useAuth() {
  const auth = useFirebaseAuth()! // assert non-null (Nuxt plugin initializes Firebase)
  const currentUser = useCurrentUser()
  useFireUXConfig() // ensure config initialized (role used inside ensure)

  // simple per-session guard so postProcessAuth runs once per UID
  const lastEnsuredUid = ref<string | null>(null)
  const ensuring = ref(false)

  const postProcessAuth = async (user: { uid: string } | null | undefined) => {
    if (!user?.uid) return null
    if (ensuring.value || lastEnsuredUid.value === user.uid) return user

    try {
      ensuring.value = true

      // Ensure global identity and, if tenant app, app membership
      const { ensureUser } = useUserEnsure()
      await ensureUser()

      lastEnsuredUid.value = user.uid
    } catch (e) {
      console.warn('[useAuth] postProcessAuth failed:', e)
    } finally {
      ensuring.value = false
    }
    return user
  }

  const authState = computed(() =>
    currentUser.value && !currentUser.value.isAnonymous
      ? 'AUTHENTICATED'
      : 'NOT_AUTHENTICATED'
  )

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      await postProcessAuth(result.user)
      console.log('✅ Google Sign-In Success - User:', result.user)
      return result.user
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('❌ Google Sign-In Failed:', error.message)
      } else {
        console.error('❌ Google Sign-In Failed:', error)
      }
      return null
    }
  }

  const signInWithEmailPassword = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      await postProcessAuth(result.user)
      console.log('✅ Email Sign-In Success - User:', result.user)
      return result.user
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('❌ Email Sign-In Failed:', error.message)
      } else {
        console.error('❌ Email Sign-In Failed:', error)
      }
      return null
    }
  }

  const signUpWithEmailPassword = async (email: string, password: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      await postProcessAuth(result.user)
      console.log('✅ Email Sign-Up Success - User:', result.user)
      return result.user
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('❌ Email Sign-Up Failed:', error.message)
      } else {
        console.error('❌ Email Sign-Up Failed:', error)
      }
      return null
    }
  }

  const signOutUser = async () => {
    try {
      await signOut(auth)
      // reset guard on sign-out so next sign-in will re-run ensure
      lastEnsuredUid.value = null
      console.log('✅ Signed out successfully')
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('❌ Sign-Out Failed:', error.message)
      } else {
        console.error('❌ Sign-Out Failed:', error)
      }
    }
  }

  return {
    currentUser,
    authState,
    signInWithGoogle,
    signInWithEmailPassword,
    signUpWithEmailPassword,
    signOutUser,
  }
}
