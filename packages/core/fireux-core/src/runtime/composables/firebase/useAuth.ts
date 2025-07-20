// ~/composables/useAuth.ts
import { computed } from 'vue'
import { useFirebaseAuth, useCurrentUser } from 'vuefire'
import { useCoreUser } from '../firestore/CoreUser/useCoreUser'
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
} from 'firebase/auth'

export function useAuth() {
  const auth = useFirebaseAuth()! // assert non-null
  const currentUser = useCurrentUser()

  // const setUserTenantIdClaim = async user => {
  //   try {
  //     const functions = getFunctions()
  //     const setCustomClaims = httpsCallable(functions, 'setTenantIdClaim')
  //     await setCustomClaims({ uid: user.uid, appId })
  //     await user.getIdToken(true)
  //   } catch (error) {
  //     console.error('❌ Failed to set custom claims:', error.message)
  //   }
  // }

  const postProcessAuth = async (_user: unknown) => {
    const { ensureCoreUser } = await useCoreUser()
    await ensureCoreUser()
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
