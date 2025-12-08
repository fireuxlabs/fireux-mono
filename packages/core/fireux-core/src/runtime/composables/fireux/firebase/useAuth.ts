// FILE: packages/core/fireux-core/src/runtime/composables/firebase/useAuth.ts
import {
  computed,
  ref,
  shallowRef,
  watch,
  type Ref,
  type WatchStopHandle,
} from 'vue'
import { onNuxtReady } from '#imports'
import { useFirebaseAuth, useCurrentUser } from 'vuefire'
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
} from 'firebase/auth'
import { useUserEnsure } from 'fireux-core/runtime/composables/fireux/firestore/core/user/mutations/useUserEnsure.ts'

type AuthUser = {
  uid?: string | null
  isAnonymous?: boolean
  email?: string | null
  displayName?: string | null
  photoURL?: string | null
}

export function useAuth() {
  let auth: ReturnType<typeof useFirebaseAuth> | null = null
  const currentUser: Ref<AuthUser | null | undefined> = shallowRef<
    AuthUser | null | undefined
  >(undefined)
  let stopCurrentUserWatcher: WatchStopHandle | null = null

  const bindVueFireAuth = () => {
    try {
      auth = useFirebaseAuth()
    } catch (error) {
      if (import.meta.dev) {
        console.warn(
          '[fireux-core/useAuth] useFirebaseAuth() not ready yet',
          error
        )
      }
      auth = null
      return
    }

    let source: Ref<AuthUser | null | undefined>
    try {
      source = useCurrentUser() as Ref<AuthUser | null | undefined>
    } catch (error) {
      if (import.meta.dev) {
        console.warn(
          '[fireux-core/useAuth] useCurrentUser() not ready yet',
          error
        )
      }
      auth = null
      return
    }

    stopCurrentUserWatcher?.()
    stopCurrentUserWatcher = watch(
      source,
      (value) => {
        currentUser.value = value
      },
      { immediate: true }
    )
  }

  if (import.meta.client) {
    bindVueFireAuth()

    if (!auth) {
      onNuxtReady(() => {
        if (!auth) bindVueFireAuth()
      })
    }
  }

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
