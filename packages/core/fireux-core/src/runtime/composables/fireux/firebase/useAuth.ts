// FILE: packages/core/fireux-core/src/runtime/composables/firebase/useAuth.ts
// Concurrent edit — 2026-07-20 13:19 CEST — Account consent follow-up: preserve explicit current legal acceptance across redirect auth.
// Concurrent edit — 2026-07-21 14:32 CEST — Runtime warning repair: coordinate account provisioning across every useAuth consumer.
// Concurrent edit — 2026-07-21 15:25 CEST — Dashboard SSR repair: keep browser-only VueFire auth binding out of server rendering and Nuxt payload state.
import { useState } from '#imports'
import { getApps } from 'firebase/app'
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type Auth,
  type User,
} from 'firebase/auth'
import { computed, watch, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCurrentUser, useFirebaseAuth } from '../firestore/vuefire'
import { useUserBootstrap } from '../../../user/composables/useUserBootstrap'
import {
  clearPendingAccountConsent,
  rememberPendingAccountConsent,
} from './account-consent'
import {
  createAuthAccountProvisioner,
  type AccountProvisionState,
} from './auth-account-provisioning'
import { signInWithGoogleAuth } from './google-auth-actions'

let authStateUnsubscribe: (() => void) | null = null
let bindRetryTimer: ReturnType<typeof setTimeout> | null = null

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
  const auth = useState<Auth | null>('fireux_auth_instance', () => null)
  const currentUser = useState<User | null>(
    'fireux_auth_current_user',
    () => null
  ) as Ref<User | null>
  const isReady = useState('fireux_auth_ready', () => false)
  const hasAuthState = useState('fireux_auth_has_auth_state', () => false)
  const lastBindError = useState<unknown>('fireux_auth_bind_error', () => null)
  const lastAccountProvisionError = useState<unknown>(
    'fireux_auth_account_provision_error',
    () => null
  )
  const accountProvisionState = useState<AccountProvisionState>(
    'fireux_auth_account_provision_state',
    () => ({ uid: null, status: 'idle', generation: 0 })
  )

  const armAuthStateResolution = () => {
    if (!import.meta.client) return
    if (hasAuthState.value) return
    if (authStateUnsubscribe) return

    const authInstance: Auth | null =
      auth.value || (getApps().length ? getAuth() : null)
    if (!authInstance) return

    // Resolve exactly once: this flips true when Firebase has finished
    // determining the initial auth state (signed-in or signed-out).
    authStateUnsubscribe = onAuthStateChanged(
      authInstance,
      async (u) => {
        let resolvedUser = u
        if (!resolvedUser) {
          try {
            resolvedUser = (await signInAnonymously(authInstance)).user
          } catch (error) {
            lastBindError.value = error
          }
        }
        currentUser.value = resolvedUser
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

  const scheduleBindRetry = () => {
    if (!import.meta.client) return
    if (isReady.value || hasAuthState.value) return
    if (bindRetryTimer) return

    bindRetryTimer = globalThis.setTimeout(() => {
      bindRetryTimer = null
      if (isReady.value || hasAuthState.value) return
      bind()
      armAuthStateResolution()
      scheduleBindRetry()
    }, 100)
  }

  const bind = () => {
    if (import.meta.server) {
      auth.value = null
      currentUser.value = null
      isReady.value = false
      hasAuthState.value = false
      lastBindError.value = null
      return false
    }

    try {
      const bound = tryBindVueFire()
      auth.value = bound.auth
      currentUser.value = bound.currentUser.value
      // keep it live
      watch(bound.currentUser, (v: User | null) => (currentUser.value = v), {
        immediate: true,
      })
      isReady.value = true
      armAuthStateResolution()
      lastBindError.value = null

      return true
    } catch (e) {
      auth.value = null
      currentUser.value = null
      isReady.value = false
      hasAuthState.value = false
      lastBindError.value = e

      return false
    }
  }

  // first attempt (works when vuefire is already installed)
  bind()
  scheduleBindRetry()

  // Retry after the current tick without relying on component lifecycle APIs.
  // useAuth() also runs in route middleware, where onMounted() is invalid.
  if (import.meta.client) {
    queueMicrotask(() => {
      if (!isReady.value) bind()
      armAuthStateResolution()
      scheduleBindRetry()
    })
  }

  const uid = computed<string | null>(() => currentUser.value?.uid ?? null)
  const isAuthenticated = computed(
    () => !!currentUser.value && !currentUser.value.isAnonymous
  )
  const hasIdentity = computed(() => Boolean(currentUser.value?.uid))
  const authState = computed(() =>
    currentUser.value && !currentUser.value.isAnonymous
      ? 'AUTHENTICATED'
      : 'NOT_AUTHENTICATED'
  )

  // Account and canonical User provisioning is an explicit onboarding action.
  // Auth establishes the Firebase identity only; it must not turn a routine
  // sign-in into a hidden Firestore or Storage mutation.
  // IMPORTANT: composables like `useRouter()` / `useNuxtApp()` must be called
  // while a component instance exists (i.e. during setup). We create the
  // user-create composable once here, then call its methods later.
  const userCreate = import.meta.client ? useUserBootstrap() : null

  const {
    retry: retryProvisioning,
    reset: resetAccountProvisioning,
    creating,
  } = createAuthAccountProvisioner({
    currentUser,
    isReady,
    state: accountProvisionState,
    lastError: lastAccountProvisionError,
    userCreate,
  })

  const retryAccountProvisioning = async (termsVersion?: string) => {
    if (termsVersion) rememberPendingAccountConsent(termsVersion)
    return await retryProvisioning()
  }

  async function ensureSignedInUser(user: User | null, _termsVersion?: string) {
    if (!user?.uid) return user
    currentUser.value = user
    return user
  }

  // ─────────────────────────────────────────────
  // Auth actions (no-op safely until ready)
  // ─────────────────────────────────────────────
  const signInWithGoogle = (termsVersion?: string) =>
    signInWithGoogleAuth(auth, termsVersion, ensureSignedInUser)

  const signInWithEmailPassword = async (email: string, password: string) => {
    if (!auth.value) return null
    clearPendingAccountConsent()
    const result = await signInWithEmailAndPassword(
      auth.value,
      email,
      password
    ).catch(() => null)
    return await ensureSignedInUser(result?.user ?? null)
  }

  const signUpWithEmailPassword = async (
    email: string,
    password: string,
    displayName?: string
  ) => {
    if (!auth.value) return null
    clearPendingAccountConsent()
    const result = await createUserWithEmailAndPassword(
      auth.value,
      email,
      password
    ).catch(() => null)
    if (!result?.user) {
      clearPendingAccountConsent()
      return null
    }
    const normalizedDisplayName = String(displayName || '').trim()
    if (normalizedDisplayName) {
      await updateProfile(result.user, { displayName: normalizedDisplayName })
    }
    currentUser.value = result.user
    return result.user
  }

  const signOutUser = async (redirectTo: string = '/') => {
    if (!import.meta.client) return

    const authInstance: Auth | null =
      auth.value || (getApps().length ? getAuth() : null)

    // Always clear shared state so every auth consumer reacts immediately.
    const signedOutUid = currentUser.value?.uid ?? null
    resetAccountProvisioning(signedOutUid)
    currentUser.value = null
    clearPendingAccountConsent()

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
    hasIdentity,
    authState,
    creating,

    // readiness
    isReady,
    hasAuthState,
    lastBindError,
    lastAccountProvisionError,

    signInWithGoogle,
    signInWithEmailPassword,
    signUpWithEmailPassword,
    retryAccountProvisioning,
    signOutUser,
  }
}
