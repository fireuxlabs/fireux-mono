// FILE: packages/core/fireux-core/src/runtime/composables/firebase/useAuth.ts
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
      const mod = (await import(/* @vite-ignore */ ensurePath)) as EnsureModule | null
      const ensureUser = mod?.useUserEnsure?.().ensureUser
      if (typeof ensureUser === 'function') {
        await ensureUser()
        return
      }
    } catch {
      // ignore in prod; warn in dev if you want
    }
  }
}

function resolveFirebaseAuth() {
  if (!import.meta.client) return null
  try {
    return useFirebaseAuth()
  } catch {
    return null
  }
}

function resolveCurrentUser(): Ref<AuthUser | null | undefined> {
  if (!import.meta.client) return shallowRef<AuthUser | null | undefined>(undefined)
  try {
    return useCurrentUser() as Ref<AuthUser | null | undefined>
  } catch {
    return shallowRef<AuthUser | null | undefined>(undefined)
  }
}

export function useAuth() {
  const auth = resolveFirebaseAuth()
  const currentUser = resolveCurrentUser()

  const lastEnsuredUid = ref<string | null>(null)
  const ensuring = ref(false)

  const postProcessAuth = async (user: { uid?: string | null } | null | undefined) => {
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
    currentUser.value && !currentUser.value.isAnonymous ? 'AUTHENTICATED' : 'NOT_AUTHENTICATED'
  )

  const signInWithGoogle = async () => {
    if (!auth) return null
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider).catch(() => null)
    if (result) await postProcessAuth(result.user)
    return result?.user ?? null
  }

  const signInWithEmailPassword = async (email: string, password: string) => {
    if (!auth) return null
    const result = await signInWithEmailAndPassword(auth, email, password).catch(() => null)
    if (result) await postProcessAuth(result.user)
    return result?.user ?? null
  }

  const signUpWithEmailPassword = async (email: string, password: string) => {
    if (!auth) return null
    const result = await createUserWithEmailAndPassword(auth, email, password).catch(() => null)
    if (result) await postProcessAuth(result.user)
    return result?.user ?? null
  }

  const signOutUser = async (): Promise<void> => {
    if (!auth) return
    await signOut(auth).catch(() => {})
    lastEnsuredUid.value = null
  }

  // --- Clean surfaces ---
  const uid = computed(() => currentUser.value?.uid ?? null)       // reactive ref
  const isAuthenticated = computed(() => !!uid.value)              // reactive ref
  const uidOrNull = () => uid.value                                // snapshot getter
  const uidOrThrow = () => {                                       // snapshot getter w/ guard
    if (!uid.value) throw new Error('Not authenticated')
    return uid.value
  }

  return {
    currentUser,
    uid,                // use this with useUserFetch(uid)
    isAuthenticated,
    uidOrNull,          // optional: snapshot if you really need a value
    uidOrThrow,         // optional: throws if unauthenticated
    authState,
    signInWithGoogle,
    signInWithEmailPassword,
    signUpWithEmailPassword,
    signOutUser,
  }
}