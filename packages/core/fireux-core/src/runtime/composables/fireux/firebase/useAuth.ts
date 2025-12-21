// FILE: packages/core/fireux-core/src/runtime/composables/firebase/useAuth.ts
import { computed, onMounted, ref, watch, type Ref } from 'vue'
import { useFirebaseAuth, useCurrentUser } from 'vuefire'
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  type Auth,
  type User,
} from 'firebase/auth'
import { useUserEnsure } from 'fireux-core/runtime/composables/fireux/firestore/core/user/mutations/useUserEnsure.ts'

export type AuthUser = {
  uid?: string | null
  isAnonymous?: boolean
  email?: string | null
  displayName?: string | null
  photoURL?: string | null
}

function tryBindVueFire() {
  // These can throw if nuxt-vuefire hasn’t installed the auth module yet
  const auth = useFirebaseAuth()
  const currentUser = useCurrentUser() as Ref<User | null>
  return { auth, currentUser }
}

export function useAuth() {
  // “stable” refs we always return (never throw)
  const auth = ref<Auth | null>(null)
  const currentUser = ref<User | null>(null) as Ref<User | null>
  const isReady = ref(false)
  const lastBindError = ref<unknown>(null)

  const shouldDebug = () => {
    if (!import.meta.dev || !import.meta.client) return false
    try {
      return window.location.pathname.startsWith('/auth')
    } catch {
      return false
    }
  }

  const bind = () => {
    try {
      const bound = tryBindVueFire()
      auth.value = bound.auth
      currentUser.value = bound.currentUser.value
      // keep it live
      watch(
        bound.currentUser,
        (v) => (currentUser.value = v),
        { immediate: true }
      )
      isReady.value = true
      lastBindError.value = null

      if (shouldDebug()) {
        // eslint-disable-next-line no-console
        console.log('[fireux][auth] vuefire bound', {
          hasAuth: !!auth.value,
          uid: currentUser.value?.uid ?? null,
        })
      }

      return true
    } catch (e) {
      auth.value = null
      currentUser.value = null
      isReady.value = false
      lastBindError.value = e

      if (shouldDebug()) {
        // eslint-disable-next-line no-console
        console.warn('[fireux][auth] vuefire bind failed', e)
      }

      return false
    }
  }

  // first attempt (works when vuefire is already installed)
  bind()

  // retry after mount (covers “installed a moment later” cases)
  if (import.meta.client) {
    onMounted(() => {
      if (!isReady.value) bind()
    })
  }

  const uid = computed<string | null>(() => currentUser.value?.uid ?? null)
  const isAuthenticated = computed(() => !!uid.value)
  const authState = computed(() =>
    currentUser.value && !currentUser.value.isAnonymous
      ? 'AUTHENTICATED'
      : 'NOT_AUTHENTICATED'
  )

  if (import.meta.client) {
    watch(
      authState,
      (next) => {
        if (!shouldDebug()) return
        // eslint-disable-next-line no-console
        console.log('[fireux][auth] state', {
          state: next,
          uid: uid.value,
          isReady: isReady.value,
        })
      },
      { immediate: true }
    )
  }

  // ─────────────────────────────────────────────
  // Ensure FireUX user document exists (client-only)
  // ─────────────────────────────────────────────
  const ensuring = ref(false)
  const lastEnsuredUid = ref<string | null>(null)

  const ensureOnce = async (nextUid: string | null) => {
    if (!import.meta.client) return
    if (!nextUid) return
    if (!isReady.value) return
    if (ensuring.value) return
    if (lastEnsuredUid.value === nextUid) return

    ensuring.value = true
    try {
      await useUserEnsure().ensureUser()
      lastEnsuredUid.value = nextUid
    } finally {
      ensuring.value = false
    }
  }

  if (import.meta.client) {
    watch(uid, (nextUid) => void ensureOnce(nextUid), { immediate: true })
  }

  // ─────────────────────────────────────────────
  // Auth actions (no-op safely until ready)
  // ─────────────────────────────────────────────
  const signInWithGoogle = async () => {
    if (!auth.value) {
      if (shouldDebug()) {
        // eslint-disable-next-line no-console
        console.warn('[fireux][auth] signInWithGoogle: no firebase auth instance', {
          isReady: isReady.value,
          hasBindError: !!lastBindError.value,
          bindError:
            lastBindError.value instanceof Error
              ? {
                  name: lastBindError.value.name,
                  message: lastBindError.value.message,
                  stack: lastBindError.value.stack,
                }
              : lastBindError.value,
        })
      }
      return null
    }

    if (shouldDebug()) {
      // eslint-disable-next-line no-console
      console.log('[fireux][auth] signInWithGoogle: opening popup')
    }

    try {
      const result = await signInWithPopup(auth.value, new GoogleAuthProvider())
      return result?.user ?? null
    } catch (e) {
      if (shouldDebug()) {
        // eslint-disable-next-line no-console
        console.warn('[fireux][auth] signInWithGoogle failed', e)
      }
      return null
    }
  }

  const signInWithEmailPassword = async (email: string, password: string) => {
    if (!auth.value) return null
    const result = await signInWithEmailAndPassword(auth.value, email, password).catch(
      () => null
    )
    return result?.user ?? null
  }

  const signUpWithEmailPassword = async (email: string, password: string) => {
    if (!auth.value) return null
    const result = await createUserWithEmailAndPassword(auth.value, email, password).catch(
      () => null
    )
    return result?.user ?? null
  }

  const signOutUser = async () => {
    if (!auth.value) return
    await signOut(auth.value).catch(() => {})
    lastEnsuredUid.value = null
  }

  return {
    // note: auth is a ref now
    auth,
    currentUser,
    uid,
    isAuthenticated,
    authState,
    ensuring,

    // readiness
    isReady,
    lastBindError,

    signInWithGoogle,
    signInWithEmailPassword,
    signUpWithEmailPassword,
    signOutUser,
  }
}