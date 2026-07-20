// FILE: packages/core/fireux-core/src/runtime/composables/firebase/useAuth.ts
// Concurrent edit — 2026-07-20 13:19 CEST — Account consent follow-up: preserve explicit current legal acceptance across redirect auth.
import { useState } from '#imports'
import { getApps } from 'firebase/app'
import {
  createUserWithEmailAndPassword,
  getAuth,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth'
import { computed, ref, watch, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCurrentUser, useFirebaseAuth } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { FIREUX_ACCOUNT_TERMS_VERSION } from '../../../models/core/supporting/user-account-provisioning'
import { useUserCreate } from '../firestore/core/user/mutations/useUserCreate'
import { provisionSignedInUserAccount } from './userAccountProvisioning'

let googleSignInInFlight: Promise<User | null> | null = null
let googleRedirectResultInFlight: Promise<User | null> | null = null
let authStateUnsubscribe: (() => void) | null = null
let bindRetryTimer: ReturnType<typeof setTimeout> | null = null
let pendingAccountConsentVersion: string | null = null

const ACCOUNT_CONSENT_STORAGE_KEY = 'fireux_pending_account_consent'
const ACCOUNT_CONSENT_MAX_AGE_MS = 60 * 60 * 1000

function rememberPendingAccountConsent(termsVersion: string) {
  if (termsVersion !== FIREUX_ACCOUNT_TERMS_VERSION) {
    throw new Error(
      'Accept the current Terms of Service and acknowledge the Privacy Policy.'
    )
  }
  pendingAccountConsentVersion = termsVersion
  if (!import.meta.client) return
  try {
    sessionStorage.setItem(
      ACCOUNT_CONSENT_STORAGE_KEY,
      JSON.stringify({ termsVersion, createdAt: Date.now() })
    )
  } catch {
    // Popup auth can still use the in-memory value when storage is unavailable.
  }
}

function readPendingAccountConsent() {
  if (pendingAccountConsentVersion === FIREUX_ACCOUNT_TERMS_VERSION) {
    return pendingAccountConsentVersion
  }
  if (!import.meta.client) return null
  try {
    const raw = sessionStorage.getItem(ACCOUNT_CONSENT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const createdAt = Number(parsed.createdAt)
    if (
      parsed.termsVersion !== FIREUX_ACCOUNT_TERMS_VERSION ||
      !Number.isFinite(createdAt) ||
      createdAt > Date.now() ||
      Date.now() - createdAt > ACCOUNT_CONSENT_MAX_AGE_MS
    ) {
      try {
        sessionStorage.removeItem(ACCOUNT_CONSENT_STORAGE_KEY)
      } catch {}
      return null
    }
    pendingAccountConsentVersion = FIREUX_ACCOUNT_TERMS_VERSION
    return pendingAccountConsentVersion
  } catch {
    try {
      sessionStorage.removeItem(ACCOUNT_CONSENT_STORAGE_KEY)
    } catch {}
    return null
  }
}

function clearPendingAccountConsent() {
  pendingAccountConsentVersion = null
  if (import.meta.client) {
    try {
      sessionStorage.removeItem(ACCOUNT_CONSENT_STORAGE_KEY)
    } catch {}
  }
}

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

function shouldPreferRedirectGoogleAuth(): boolean {
  // Keep one auth path across environments:
  // popup first everywhere, redirect only as an explicit fallback when popup fails.
  return false
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
  const currentUser = useState<User | null>('fireux_auth_current_user', () => null) as Ref<User | null>
  const isReady = useState('fireux_auth_ready', () => false)
  const hasAuthState = useState('fireux_auth_has_auth_state', () => false)
  const lastBindError = useState<unknown>('fireux_auth_bind_error', () => null)
  const lastAccountProvisionError = useState<unknown>(
    'fireux_auth_account_provision_error',
    () => null
  )

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

  const retryAccountProvisioning = async () => {
    const nextUid = currentUser.value?.uid ?? null
    if (!nextUid) return false
    lastCreatedUid.value = null
    await createOnce(nextUid)
    return lastCreatedUid.value === nextUid
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

      void resolveGoogleRedirectResult()

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
      void resolveGoogleRedirectResult()
    })
  }

  const uid = computed<string | null>(() => currentUser.value?.uid ?? null)
  const isAuthenticated = computed(() => !!uid.value)
  const authState = computed(() =>
    currentUser.value && !currentUser.value.isAnonymous
      ? 'AUTHENTICATED'
      : 'NOT_AUTHENTICATED'
  )

  // ─────────────────────────────────────────────
  // Create FireUX user document when auth exists but Firestore does not.
  // ─────────────────────────────────────────────
  // IMPORTANT: composables like `useRouter()` / `useNuxtApp()` must be called
  // while a component instance exists (i.e. during setup). We create the
  // user-create composable once here, then call its methods later.
  const userCreate = import.meta.client ? useUserCreate() : null

  const creating = ref(false)
  const lastCreatedUid = ref<string | null>(null)
  let createInFlight: Promise<void> | null = null

  const createOnce = async (nextUid: string | null) => {
    if (!import.meta.client) return
    if (!nextUid) return
    if (currentUser.value?.isAnonymous) return
    if (!isReady.value) return
    if (creating.value && createInFlight) {
      await createInFlight
      return
    }
    if (lastCreatedUid.value === nextUid) return
    if (!userCreate) return

    creating.value = true
    lastAccountProvisionError.value = null
    createInFlight = (async () => {
      try {
        const signedInUser = currentUser.value
        if (!signedInUser || signedInUser.uid !== nextUid) return
        const termsVersion = readPendingAccountConsent() ?? undefined
        await provisionSignedInUserAccount(signedInUser, termsVersion)
        if (termsVersion) clearPendingAccountConsent()
        await userCreate.createUser()
        lastCreatedUid.value = nextUid
      } catch (error) {
        lastAccountProvisionError.value = error
        throw error
      }
    })()

    try {
      await createInFlight
    } finally {
      createInFlight = null
      creating.value = false
    }
  }

  const ensureSignedInUser = async (
    user: User | null,
    termsVersion?: string
  ) => {
    if (!user?.uid) return user
    if (termsVersion) rememberPendingAccountConsent(termsVersion)
    currentUser.value = user
    if (user.isAnonymous) return user
    await createOnce(user.uid)
    return user
  }

  if (import.meta.client) {
    watch(
      uid,
      (nextUid: string | null) => void createOnce(nextUid).catch(() => {}),
      { immediate: true }
    )
  }

  async function resolveGoogleRedirectResult() {
    if (!import.meta.client) return null

    const authInstance: Auth | null =
      auth.value || (getApps().length ? getAuth() : null)

    if (!authInstance) return null

    if (googleRedirectResultInFlight) {
      return googleRedirectResultInFlight
    }

    googleRedirectResultInFlight = (async () => {
      let result
      try {
        result = await getRedirectResult(authInstance)
      } catch {
        clearPendingAccountConsent()
        return authInstance.currentUser ?? null
      }

      if (!result?.user) {
        return ensureSignedInUser(authInstance.currentUser ?? null)
      }
      return ensureSignedInUser(
        result.user,
        readPendingAccountConsent() ?? undefined
      )
    })()

    try {
      return await googleRedirectResultInFlight
    } finally {
      googleRedirectResultInFlight = null
    }
  }

  // ─────────────────────────────────────────────
  // Auth actions (no-op safely until ready)
  // ─────────────────────────────────────────────
  const signInWithGoogle = async (termsVersion: string) => {
    rememberPendingAccountConsent(termsVersion)
    if (googleSignInInFlight) {
      return googleSignInInFlight
    }

    const run = async () => {
      if (!auth.value) {
        clearPendingAccountConsent()
        return null
      }

      const provider = new GoogleAuthProvider()
      const preferRedirect = shouldPreferRedirectGoogleAuth()

      if (preferRedirect) {
        try {
          await signInWithRedirect(auth.value, provider)
        } catch {
          clearPendingAccountConsent()
        }
        return null
      }

      let result
      try {
        result = await signInWithPopup(auth.value, provider)
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
          } catch {
            clearPendingAccountConsent()
          }
          return null
        }
        clearPendingAccountConsent()
        return null
      }

      return await ensureSignedInUser(result.user, termsVersion)
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
    clearPendingAccountConsent()
    const result = await signInWithEmailAndPassword(auth.value, email, password).catch(
      () => null
    )
    return await ensureSignedInUser(result?.user ?? null)
  }

  const signUpWithEmailPassword = async (
    email: string,
    password: string,
    termsVersion: string
  ) => {
    if (!auth.value) return null
    rememberPendingAccountConsent(termsVersion)
    const result = await createUserWithEmailAndPassword(
      auth.value,
      email,
      password
    ).catch(() => null)
    if (!result?.user) {
      clearPendingAccountConsent()
      return null
    }
    return await ensureSignedInUser(result.user, termsVersion)
  }

  const signOutUser = async (redirectTo: string = '/') => {
    if (!import.meta.client) return

    const authInstance: Auth | null =
      auth.value || (getApps().length ? getAuth() : null)

    // Always clear local state so the UI reacts immediately.
    lastCreatedUid.value = null
    creating.value = false
    currentUser.value = null
    clearPendingAccountConsent()
    lastAccountProvisionError.value = null

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
