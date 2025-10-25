import { computed, ref, shallowRef, type Ref } from 'vue'
import { useFirebaseAuth, useCurrentUser } from 'vuefire'
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
} from 'firebase/auth'

type AuthUser = {
  uid?: string | null
  isAnonymous?: boolean
  email?: string | null
  displayName?: string | null
  photoURL?: string | null
}

/**
 * Attempt to run user ensure if the module exists.
 * This keeps useAuth decoupled from Firestore modules.
 */
type EnsureModule = {
  useUserEnsure?: () => { ensureUser?: () => Promise<unknown> }
}

async function tryEnsureUserOnce(uid: string | null | undefined) {
  if (!uid) return
  const ensurePaths = [
    '../firestore/core/user/useUserEnsure',
    '../../composables/firestore/core/user/useUserEnsure',
  ] as const

  for (const ensurePath of ensurePaths) {
    try {
      const mod = (await import(
        /* @vite-ignore */ ensurePath
      )) as EnsureModule | null
      const ensureUser = mod?.useUserEnsure?.().ensureUser
      if (typeof ensureUser === 'function') {
        await ensureUser()
        return
      }
    } catch (error) {
      if (import.meta.dev) {
        console.warn('[useAuth] optional ensureUser failed (ignored):', {
          ensurePath,
          error,
        })
      }
    }
  }
}

function resolveFirebaseAuth() {
  if (!import.meta.client) return null
  try {
    return useFirebaseAuth()
  } catch (error) {
    if (import.meta.dev) {
      console.warn(
        '[useAuth] useFirebaseAuth unavailable; falling back to null.',
        error
      )
    }
    return null
  }
}

function resolveCurrentUser(): Ref<AuthUser | null | undefined> {
  if (!import.meta.client) {
    return shallowRef<AuthUser | null | undefined>(undefined)
  }
  try {
    return useCurrentUser() as Ref<AuthUser | null | undefined>
  } catch (error) {
    if (import.meta.dev) {
      console.warn(
        '[useAuth] useCurrentUser unavailable. Ensure VueFire auth module is registered.',
        error
      )
    }
    return shallowRef<AuthUser | null | undefined>(undefined)
  }
}

export function useAuth() {
  const auth = resolveFirebaseAuth()

  const currentUser = resolveCurrentUser()

  const lastEnsuredUid = ref<string | null>(null)
  const ensuring = ref(false)

  const postProcessAuth = async (
    user: { uid?: string | null } | null | undefined
  ) => {
    const uid = user?.uid ?? null
    if (!uid || !auth) return user
    if (ensuring.value || lastEnsuredUid.value === uid) return user

    try {
      ensuring.value = true
      await tryEnsureUserOnce(uid)
      lastEnsuredUid.value = uid
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
    if (!auth) return null
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      await postProcessAuth(result.user)
      return result.user
    } catch (error) {
      if (import.meta.dev) console.error('❌ Google Sign-In Failed:', error)
      return null
    }
  }

  const signInWithEmailPassword = async (email: string, password: string) => {
    if (!auth) return null
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      await postProcessAuth(result.user)
      return result.user
    } catch (error) {
      if (import.meta.dev) console.error('❌ Email Sign-In Failed:', error)
      return null
    }
  }

  const signUpWithEmailPassword = async (email: string, password: string) => {
    if (!auth) return null
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      await postProcessAuth(result.user)
      return result.user
    } catch (error) {
      if (import.meta.dev) console.error('❌ Email Sign-Up Failed:', error)
      return null
    }
  }

  const signOutUser = async (): Promise<void> => {
    if (!auth) return
    try {
      await signOut(auth)
      lastEnsuredUid.value = null
    } catch (error) {
      if (import.meta.dev) console.error('❌ Sign-Out Failed:', error)
    }
  }

  const uid = computed(() => currentUser.value?.uid ?? null)

  return {
    currentUser,
    uid,
    authState,
    signInWithGoogle,
    signInWithEmailPassword,
    signUpWithEmailPassword,
    signOutUser,
  }
}
