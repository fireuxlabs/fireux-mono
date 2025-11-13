// FILE: packages/core/fireux-core/src/runtime/composables/firebase/useAuth.ts
import { computed, ref, shallowRef, watch, type Ref } from 'vue'
import { useFirebaseAuth, useCurrentUser } from 'vuefire'
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
} from 'firebase/auth'
import { useUserEnsure } from 'fireux-core/runtime/composables/firestore/core/user/main/useUserEnsure.ts'

type AuthUser = {
  uid?: string | null
  isAnonymous?: boolean
  email?: string | null
  displayName?: string | null
  photoURL?: string | null
}

export function useAuth() {
  const auth = import.meta.client ? useFirebaseAuth() : null
  const currentUser: Ref<AuthUser | null | undefined> = import.meta.client
    ? (useCurrentUser() as Ref<AuthUser | null | undefined>)
    : shallowRef<AuthUser | null | undefined>(undefined)

  const ensureUser = import.meta.client ? useUserEnsure().ensureUser : null
  const ensuring = ref(false)
  const lastEnsuredUid = ref<string | null>(null)

  const ensureOnce = async (uid: string | null | undefined) => {
    if (!uid || !ensureUser) return
    if (ensuring.value || lastEnsuredUid.value === uid) return
    ensuring.value = true
    try {
      await ensureUser()
      lastEnsuredUid.value = uid
    } finally {
      ensuring.value = false
    }
  }

  if (import.meta.client) {
    watch(
      () => currentUser.value?.uid ?? null,
      (uid) => void ensureOnce(uid),
      { immediate: true }
    )
  }

  const signInWithGoogle = async () => {
    if (!auth) return null
    const result = await signInWithPopup(auth, new GoogleAuthProvider()).catch(
      () => null
    )
    return result?.user ?? null
  }

  const signInWithEmailPassword = async (email: string, password: string) => {
    if (!auth) return null
    const result = await signInWithEmailAndPassword(
      auth,
      email,
      password
    ).catch(() => null)
    return result?.user ?? null
  }

  const signUpWithEmailPassword = async (email: string, password: string) => {
    if (!auth) return null
    const result = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    ).catch(() => null)
    return result?.user ?? null
  }

  const signOutUser = async () => {
    if (!auth) return
    await signOut(auth).catch(() => {})
    lastEnsuredUid.value = null
  }

  const uid = computed(() => currentUser.value?.uid ?? null)
  const isAuthenticated = computed(() => !!uid.value)
  const authState = computed(() =>
    currentUser.value && !currentUser.value.isAnonymous
      ? 'AUTHENTICATED'
      : 'NOT_AUTHENTICATED'
  )

  return {
    currentUser,
    uid,
    isAuthenticated,
    authState,
    signInWithGoogle,
    signInWithEmailPassword,
    signUpWithEmailPassword,
    signOutUser,
  }
}
