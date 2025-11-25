<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/Auth/System.vue -->
<template>
  <UContainer class="center-content">
    <ClientOnly>
      <Transition name="fade">
        <div v-if="authState === 'AUTHENTICATED'">
          <OrganismsAuthAuthenticated />
        </div>

        <div v-else>
          <section class="auth-shell">
            <UAuthForm
              class="auth-form"
              :title="title"
              :fields="fields"
              :submit="submitBtn"
              :loading="loading"
              @submit="onSubmit"
            >
              <template #leading>
                <img :src="appLogo" :alt="`${appName} logo`" class="app-logo" />
              </template>

              <template #providers>
                <UButton
                  block
                  variant="ghost"
                  :loading="providerLoading"
                  @click="handleGoogle"
                >
                  <img
                    :src="googleLogo"
                    alt="Continue with Google"
                    class="google-logo"
                  />
                </UButton>
              </template>

              <template #validation>
                <UAlert
                  v-if="error"
                  color="warning"
                  variant="subtle"
                  :title="error"
                />
              </template>

              <template #footer>
                <div class="footer-stack">
                  <p class="ecosystem-hint">
                    Use your {{ ecosystemLabel }} account across the FireUX
                    network.
                  </p>

                  <USwitch v-model="isSignUp" :label="switchLabel" />

                  <UAlert
                    v-if="existingUserPill"
                    color="info"
                    variant="soft"
                    :title="existingUserTitle"
                    class="existing-user-alert"
                  >
                    <template #description>
                      <p
                        v-if="existingUserDescription"
                        class="existing-user-copy"
                      >
                        {{ existingUserDescription }}
                      </p>
                      <OrganismsUserCardsPill
                        v-if="existingUserPill"
                        :user="existingUserPill"
                        class="existing-user-pill"
                      />
                    </template>
                  </UAlert>
                </div>
              </template>
            </UAuthForm>
          </section>
        </div>
      </Transition>
    </ClientOnly>
  </UContainer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { FirebaseError } from 'firebase/app'
import { collection, getDocs, limit, query, where } from 'firebase/firestore'

import { useFirestore } from 'vuefire'

import { useAuth } from 'fireux-core/runtime/composables/firebase/useAuth.ts'
import { useFireUXConfig } from '../../../composables/FireUXConfig.ts'
import { useUserInterface } from '../../../composables/firestore/core/user/main/useUserInterface.ts'
import type { User } from 'fireux-core/runtime/models/core/user.model.ts'

const router = useRouter()
const {
  authState,
  signInWithGoogle,
  signInWithEmailPassword,
  signUpWithEmailPassword,
} = useAuth()
const { appName, ecosystem } = useFireUXConfig()
const db = useFirestore()

const isSignUp = ref(false)
const loading = ref(false)
const providerLoading = ref(false)
const error = ref<string | null>(null)
const existingUser = ref<User | null>(null)
const { pillProps: toExistingUserPill } = useUserInterface(existingUser)

const title = computed(() =>
  isSignUp.value ? `Create your ${appName} account` : `Sign in to ${appName}`
)

const submitBtn = computed(() => ({
  label: isSignUp.value ? 'Create Account' : 'Continue',
  block: true,
}))

const switchLabel = computed(() =>
  isSignUp.value ? 'Use existing account' : 'Create a new account'
)

const ecosystemLabel = computed(() => ecosystem || 'FireUX')

const existingUserPill = computed(() =>
  existingUser.value ? toExistingUserPill() : null
)

const existingUserTitle = computed(() =>
  existingUser.value ? 'Account already exists' : ''
)

const existingUserDescription = computed(() =>
  existingUser.value
    ? `We found your ${ecosystemLabel.value} account. Sign in with it instead.`
    : ''
)

const fields = [
  { name: 'email', type: 'email', label: 'Email', required: true },
  { name: 'password', type: 'password', label: 'Password', required: true },
]

const appLogo = '/img/core/brand/wordmark-light.png'
const googleLogo = '/img/core/auth/sign-in-light.svg'

const pushDashboard = async () => {
  await router.push('/dashboard').catch(() => {})
}

const handleGoogle = async () => {
  providerLoading.value = true
  error.value = null

  try {
    const result = await signInWithGoogle()
    providerLoading.value = false
    if (result?.uid) {
      await pushDashboard()
      return
    }
    error.value = 'Google sign-in failed. Please try again.'
  } catch (err) {
    providerLoading.value = false
    error.value = resolveAuthError(err, 'provider')
    logAuthError(err, 'google')
  }
}

const onSubmit = async ({ data }: { data?: Record<string, unknown> }) => {
  const email = String(data?.email ?? '').trim()
  const password = String(data?.password ?? '')

  if (!email || !password) {
    error.value = 'Enter your email and password.'
    return
  }

  loading.value = true
  error.value = null

  try {
    const handler = isSignUp.value
      ? signUpWithEmailPassword
      : signInWithEmailPassword
    const result = await handler(email, password)
    loading.value = false

    if (result?.uid) {
      existingUser.value = null
      await pushDashboard()
      return
    }

    error.value = 'Authentication failed.'
  } catch (err) {
    loading.value = false
    if (
      err instanceof FirebaseError &&
      err.code === 'auth/email-already-in-use'
    ) {
      const coreUser = await fetchExistingUserByEmail(email)
      existingUser.value = coreUser
      isSignUp.value = false
      error.value = coreUser
        ? 'Use your existing FireUX account to sign in.'
        : 'This email is already registered. Please sign in instead.'
      return
    }

    error.value = resolveAuthError(err, isSignUp.value ? 'signup' : 'signin')
    logAuthError(err, isSignUp.value ? 'signup' : 'signin')
  }
}

const fetchExistingUserByEmail = async (
  email: string
): Promise<User | null> => {
  if (!email) return null

  try {
    const snapshot = await getDocs(
      query(collection(db, 'users'), where('email', '==', email), limit(1))
    )
    if (snapshot.empty) return null

    const docSnap = snapshot.docs[0]
    const data = docSnap.data() as User | undefined
    if (!data) return null

    return {
      ...data,
      id: data.id || docSnap.id,
    }
  } catch (lookupError) {
    if (import.meta.dev) {
      console.warn('[auth] Failed to lookup existing user', lookupError)
    }
    return null
  }
}

watch(isSignUp, (next) => {
  if (next) {
    existingUser.value = null
  }
})

const resolveAuthError = (
  err: unknown,
  context: 'signin' | 'signup' | 'provider'
): string => {
  const code = extractAuthCode(err)

  switch (code) {
    case 'auth/user-not-found':
      return 'No account found for that email. Try creating one first.'
    case 'auth/wrong-password':
    case 'auth/invalid-password':
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      return 'Incorrect email or password. Please try again.'
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in instead.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.'
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and retry.'
    case 'auth/popup-blocked':
      return 'Your browser blocked the sign-in popup. Allow popups and retry.'
    case 'auth/popup-closed-by-user':
      return 'Sign-in was cancelled before completion.'
    case 'auth/invalid-email':
      return 'That email address is not valid. Double-check and retry.'
    case 'auth/missing-email':
      return 'Enter an email address to continue.'
    default:
      break
  }

  if (err instanceof Error && err.message) {
    return err.message
  }

  return context === 'provider'
    ? 'Google sign-in failed. Please try again.'
    : 'Authentication failed. Please try again.'
}

const extractAuthCode = (err: unknown): string | null => {
  if (err instanceof FirebaseError) return err.code

  if (err && typeof err === 'object' && 'code' in err) {
    const maybeCode = (err as Record<string, unknown>).code
    if (typeof maybeCode === 'string') return maybeCode
  }

  if (err instanceof Error && typeof err.message === 'string') {
    const match = err.message.match(/\((auth\/[a-z0-9-]+)\)/i)
    if (match?.[1]) return match[1]
  }

  return null
}

const logAuthError = (err: unknown, label: string) => {
  if (!import.meta.dev) return
  console.warn(`[auth] ${label} error`, err)
}
</script>

<style scoped>
.center-content {
  display: flex;
  justify-content: center;
  width: 100%;
}

.auth-shell {
  width: 100%;
  max-width: 440px;
  margin: 0 auto;
  padding: var(--space-8, 2rem);
  border: 1px solid rgba(148, 163, 184, 0.35);
  border-radius: var(--radius-xl, 1rem);
  background-color: var(--ui-bg, #fff);
  box-shadow: var(--shadow-sm, 0 10px 30px rgba(15, 23, 42, 0.1));
}

.auth-form {
  width: 100%;
}

.app-logo {
  height: 34px;
  width: auto;
  margin: 0 auto;
}

.google-logo {
  height: 28px;
  width: auto;
}

.footer-stack {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.ecosystem-hint {
  font-size: 0.85rem;
  color: var(--ui-text-500, rgba(100, 116, 139, 0.95));
}

.existing-user-alert {
  margin-top: 0.5rem;
}

.existing-user-copy {
  margin-bottom: 0.5rem;
}

.existing-user-pill {
  max-width: 320px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
