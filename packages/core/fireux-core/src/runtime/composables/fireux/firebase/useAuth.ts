// FILE: packages/core/fireux-core/src/runtime/composables/firebase/useAuth.ts
import { getApps } from 'firebase/app'
import {
    createUserWithEmailAndPassword,
    getAuth,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    signInWithRedirect,
    signOut,
    type Auth,
    type User,
} from 'firebase/auth'
import { computed, onMounted, ref, watch, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCurrentUser, useFirebaseAuth } from 'vuefire'
import { useUserEnsure } from '../firestore/core/user/mutations/useUserEnsure'

let googleSignInInFlight: Promise<User | null> | null = null

export type AuthUser = {
  uid?: string | null
  isAnonymous?: boolean
  email?: string | null
  displayName?: string | null
  photoURL?: string | null
}

function tryBindVueFire() {
  // These can throw if VueFire Auth hasn't been installed yet.
  // (In FireUX apps, `fireux-nuxtfire` should ensure this is ready.)
  const auth = useFirebaseAuth()
  const currentUser = useCurrentUser() as Ref<User | null>
  return { auth, currentUser }
}

export function useAuth() {
  const router = (() => {
    if (!import.meta.client) return null
    try {
      return useRouter()
    } catch {
      return null
    }
  })()

  // “stable” refs we always return (never throw)
  const auth = ref<Auth | null>(null)
  const currentUser = ref<User | null>(null) as Ref<User | null>
  const isReady = ref(false)
  const hasAuthState = ref(false)
  const lastBindError = ref<unknown>(null)

  let authStateUnsubscribe: (() => void) | null = null

  const armAuthStateResolution = () => {
    if (!import.meta.client) return
    if (hasAuthState.value) return
    if (authStateUnsubscribe) return

    const authInstance: Auth | null = auth.value || (getApps().length ? getAuth() : null)
    if (!authInstance) return

    // Resolve exactly once: this flips true when Firebase has finished
    // determining the initial auth state (signed-in or signed-out).
    authStateUnsubscribe = onAuthStateChanged(
      authInstance,
      (u) => {
        currentUser.value = u
        hasAuthState.value = true
        authStateUnsubscribe?.()
        authStateUnsubscribe = null
      },
      (e) => {
        lastBindError.value = e
        hasAuthState.value = true
        authStateUnsubscribe?.()
        authStateUnsubscribe = null
      }
    )
  }

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
        (v: User | null) => (currentUser.value = v),
        { immediate: true }
      )
      isReady.value = true
      armAuthStateResolution()
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
      hasAuthState.value = false
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
      armAuthStateResolution()
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
      (next: string) => {
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
  // IMPORTANT: composables like `useRouter()` / `useNuxtApp()` must be called
  // while a component instance exists (i.e. during setup). We create the
  // user-ensure composable once here, then call its methods later.
  const userEnsure = import.meta.client ? useUserEnsure() : null

  const ensuring = ref(false)
  const lastEnsuredUid = ref<string | null>(null)

  const ensureOnce = async (nextUid: string | null) => {
    if (!import.meta.client) return
    if (!nextUid) return
    if (!isReady.value) return
    if (ensuring.value) return
    if (lastEnsuredUid.value === nextUid) return
    if (!userEnsure) return

    ensuring.value = true
    try {
      await userEnsure.ensureUser()
      lastEnsuredUid.value = nextUid
    } finally {
      ensuring.value = false
    }
  }

  if (import.meta.client) {
    watch(uid, (nextUid: string | null) => void ensureOnce(nextUid), {
      immediate: true,
    })
  }

  // ─────────────────────────────────────────────
  // Auth actions (no-op safely until ready)
  // ─────────────────────────────────────────────
  const signInWithGoogle = async () => {
    if (googleSignInInFlight) {
      return googleSignInInFlight
    }

    const run = async () => {
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

      const provider = new GoogleAuthProvider()

      try {
        const result = await signInWithPopup(auth.value, provider)
        return result?.user ?? null
      } catch (e) {
        const code =
          typeof e === 'object' && e !== null && 'code' in e
            ? String((e as { code?: unknown }).code ?? '')
            : ''

        if (
          code === 'auth/popup-blocked' ||
          code === 'auth/cancelled-popup-request'
        ) {
          try {
            await signInWithRedirect(auth.value, provider)
          } catch {}
        }

        if (shouldDebug()) {
          // eslint-disable-next-line no-console
          console.warn('[fireux][auth] signInWithGoogle failed', e)
        }
        return null
      }
    }

    googleSignInInFlight = run()
    try {
      return await googleSignInInFlight
    } finally {
      googleSignInInFlight = null
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

  const signOutUser = async (redirectTo: string = '/') => {
    if (!import.meta.client) return

    const authInstance: Auth | null =
      auth.value || (getApps().length ? getAuth() : null)

    // Always clear local state so the UI reacts immediately.
    lastEnsuredUid.value = null
    ensuring.value = false
    currentUser.value = null

    if (!authInstance) {
      await router?.replace(redirectTo).catch(() => {})
      return
    }

    await signOut(authInstance).catch(() => {})

    // Wait for Firebase to actually report signed-out before routing.
    await new Promise<void>((resolve) => {
      if (!authInstance.currentUser) return resolve()
      const timer = globalThis.setTimeout(resolve, 2000)
      const unsubscribe = onAuthStateChanged(authInstance, (u) => {
        if (u) return
        globalThis.clearTimeout(timer)
        unsubscribe()
        resolve()
      })
    })

    await router?.replace(redirectTo).catch(() => {})
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
    hasAuthState,
    lastBindError,

    signInWithGoogle,
    signInWithEmailPassword,
    signUpWithEmailPassword,
    signOutUser,
  }
}
