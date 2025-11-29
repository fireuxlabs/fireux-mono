<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/Auth/System.vue -->
<template>
  <section class="ecosystem-auth">
    <ClientOnly>
      <div class="ecosystem-card">
        <img
          v-if="wordmarkSrc"
          :src="wordmarkSrc"
          :alt="`${ecosystemLabel} wordmark`"
          class="ecosystem-wordmark"
        />
        <h2 class="ecosystem-heading">{{ formTitle }}</h2>

        <template v-if="isAuthenticated">
          <template v-if="showAuthenticatedCard">
            <p class="ecosystem-message">
              You're signed in with your {{ ecosystemLabel }} account.
            </p>
            <div class="auth-actions">
              <UButton block color="primary" @click="goToDashboard">
                Go to dashboard
              </UButton>
              <UButton
                block
                variant="ghost"
                :loading="signOutLoading"
                @click="handleSignOut"
              >
                Sign out
              </UButton>
            </div>
          </template>
          <p v-else class="ecosystem-message">
            You're signed in. Continue with the next steps above.
          </p>
        </template>

        <template v-else>
          <p class="ecosystem-message">
            {{ formSubtitle }}
          </p>

          <button
            type="button"
            class="provider-button"
            :disabled="providerLoading"
            :aria-busy="providerLoading"
            aria-label="Continue with Google"
            @click="handleGoogle"
          >
            <img :src="googleLogo" alt="Continue with Google" />
            <span class="sr-only">Continue with Google</span>
          </button>

          <div class="divider">
            <span>or continue with email</span>
          </div>

          <UForm
            :state="formState"
            class="email-form"
            @submit="handleEmailSubmit"
          >
            <UInput
              v-model="formState.email"
              type="email"
              label="Email"
              placeholder="name@example.com"
              block
            />
            <UInput
              v-model="formState.password"
              type="password"
              :label="passwordLabel"
              :placeholder="passwordPlaceholder"
              :autocomplete="passwordAutocomplete"
              class="input-spacing"
              block
            />
            <div v-if="!isTenant" class="switch-row">
              <USwitch
                v-model="isSignUp"
                :label="isSignUp ? 'Signing up' : 'Signing in'"
              />
            </div>
            <UButton type="submit" block :loading="formLoading">
              {{ submitLabel }}
            </UButton>
          </UForm>

          <UAlert
            v-if="error"
            class="mt-3"
            color="amber"
            variant="subtle"
            :title="error.title"
            :description="error.description"
          />
          <p v-if="error?.hint" class="hint">{{ error.hint }}</p>

          <p class="ecosystem-footnote">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
          <p v-if="isTenant" class="ecosystem-extra">
            Need access? Ask your {{ brandLabel }} administrator to invite you.
          </p>
          <p v-else-if="centralSignupUrl" class="ecosystem-extra">
            Prefer the central signup?
            <NuxtLink :to="centralSignupUrl" target="_blank"
              >Open portal</NuxtLink
            >.
          </p>
        </template>
      </div>
    </ClientOnly>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useColorMode } from '#imports'
import { useFireUXConfig } from '../../../composables/FireUXConfig.ts'
import { useAuth } from 'fireux-core/runtime/composables/firebase/useAuth.ts'

const props = withDefaults(
  defineProps<{
    redirectOnSuccess?: boolean
    redirectTarget?: string
    showAuthenticatedCard?: boolean
  }>(),
  {
    redirectOnSuccess: true,
    redirectTarget: '/',
    showAuthenticatedCard: true,
  }
)

const emit = defineEmits<{
  (e: 'signed-in'): void
}>()

const colorMode = useColorMode()
const router = useRouter()
const { ecosystem, role, centralSignupUrl } = useFireUXConfig()
const {
  authState,
  signOutUser,
  signInWithGoogle,
  signInWithEmailPassword,
  signUpWithEmailPassword,
} = useAuth()

const isTenant = computed(() => role === 'tenant')
const formatBrandLabel = (value?: string) => {
  if (!value) return 'FireUX'
  return value
    .split(/[-_]/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

const brandLabel = computed(() => formatBrandLabel(ecosystem) || 'FireUX')
const ecosystemLabel = brandLabel

const wordmarkSrc = computed(() => {
  if (isTenant.value) {
    return colorMode.value === 'dark'
      ? '/img/ecosystem/wordmark-dark.svg'
      : '/img/ecosystem/wordmark-light.svg'
  }
  return colorMode.value === 'dark'
    ? '/img/core/brand/wordmark-dark.png'
    : '/img/core/brand/wordmark-light.png'
})

const googleLogo = computed(() =>
  colorMode.value === 'dark'
    ? '/img/core/auth/sign-in-dark.svg'
    : '/img/core/auth/sign-in-light.svg'
)

const isAuthenticated = computed(() => authState.value === 'AUTHENTICATED')
const isSignUp = ref(false)

const formTitle = computed(() =>
  !isTenant.value && isSignUp.value ? 'Create account' : 'Sign in'
)
const formSubtitle = computed(() => {
  if (isTenant.value) {
    return `Use your ${brandLabel.value} credentials to continue.`
  }
  return isSignUp.value
    ? `Create a new ${brandLabel.value} account below.`
    : `Use your ${brandLabel.value} credentials or create a new account.`
})

const formState = reactive({
  email: '',
  password: '',
})

watch(
  () => isTenant.value,
  (tenant) => {
    if (tenant) {
      isSignUp.value = false
    }
  },
  { immediate: true }
)

const formLoading = ref(false)
const providerLoading = ref(false)
const signOutLoading = ref(false)

type AuthError = {
  title: string
  description: string
  hint?: string
} | null

const error = ref<AuthError>(null)

const submitLabel = computed(() =>
  isTenant.value || !isSignUp.value ? 'Continue' : 'Create account'
)
const passwordLabel = computed(() =>
  isTenant.value ? 'Password' : isSignUp.value ? 'Create password' : 'Password'
)
const passwordPlaceholder = computed(() =>
  isSignUp.value ? 'At least 8 characters' : 'Enter your password'
)
const passwordAutocomplete = computed(() =>
  isSignUp.value ? 'new-password' : 'current-password'
)

const afterAuthSuccess = async () => {
  if (props.redirectOnSuccess) {
    await router.push(props.redirectTarget).catch(() => {})
  } else {
    emit('signed-in')
  }
}

const setEmailError = (mode: 'sign-in' | 'sign-up') => {
  const brand = brandLabel.value
  error.value =
    mode === 'sign-up'
      ? {
          title: 'Account may already exist',
          description: `Looks like you might already have a ${brand} account with this email.`,
          hint: 'Try signing in instead.',
        }
      : {
          title: 'No account found',
          description: `We could not find a ${brand} account with that email.`,
          hint: isTenant.value
            ? 'Ask your administrator to invite you or double-check your email.'
            : 'Toggle "Create a new account" below to continue.',
        }
}

const handleGoogle = async () => {
  if (providerLoading.value) return
  providerLoading.value = true
  error.value = null
  const user = await signInWithGoogle()
  providerLoading.value = false

  if (user?.uid) {
    await afterAuthSuccess()
  } else {
    error.value = {
      title: 'Google sign-in failed',
      description: 'Please try again or continue with email.',
    }
  }
}

const handleEmailSubmit = async (event?: Event) => {
  event?.preventDefault()
  if (formLoading.value) return
  const email = formState.email.trim()
  const password = formState.password

  if (!email || !password) {
    error.value = {
      title: 'Missing information',
      description: 'Enter your email and password to continue.',
    }
    return
  }

  error.value = null
  formLoading.value = true

  const mode: 'sign-in' | 'sign-up' =
    !isTenant.value && isSignUp.value ? 'sign-up' : 'sign-in'

  const result =
    mode === 'sign-up'
      ? await signUpWithEmailPassword(email, password)
      : await signInWithEmailPassword(email, password)

  formLoading.value = false

  if (result?.uid) {
    await afterAuthSuccess()
    return
  }

  setEmailError(mode)
}

const goToDashboard = async () => {
  await router.push('/dashboard').catch(() => {})
}

const handleSignOut = async () => {
  if (signOutLoading.value) return
  signOutLoading.value = true
  try {
    await signOutUser()
  } catch (err) {
    if (import.meta.dev) {
      console.warn('[auth] sign-out failed', err)
    }
  }
  signOutLoading.value = false
  await router.push('/').catch(() => {})
}
</script>

<style scoped>
.ecosystem-auth {
  width: 100%;
  max-width: 440px;
  margin: 0 auto;
}

.ecosystem-card {
  padding: var(--space-8, 2rem);
  border: 1px solid rgba(148, 163, 184, 0.35);
  border-radius: var(--radius-xl, 1rem);
  background-color: var(--ui-bg, #fff);
  box-shadow: var(--shadow-sm, 0 10px 30px rgba(15, 23, 42, 0.1));
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.ecosystem-wordmark {
  height: 34px;
  width: auto;
  margin: 0 auto 0.25rem;
}

.ecosystem-heading {
  font-size: 1.35rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.ecosystem-message {
  font-size: 0.95rem;
  color: var(--ui-text-600, #475569);
}

.provider-button {
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  display: block;
  margin: 0 auto;
}

.provider-button:disabled {
  opacity: 0.7;
  cursor: wait;
}

.provider-button img {
  display: block;
  width: auto;
  height: auto;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.divider {
  position: relative;
  width: 100%;
  text-align: center;
  margin: 1rem 0;
  font-size: 0.8rem;
  color: var(--ui-text-muted, #6b7280);
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 40%;
  height: 1px;
  background: rgba(148, 163, 184, 0.5);
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

.divider span {
  position: relative;
  padding: 0 0.5rem;
  background-color: var(--ui-bg, #fff);
}

.email-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: left;
}

.input-spacing {
  margin-top: 0.75rem;
}

.switch-row {
  display: flex;
  justify-content: center;
  margin: 0.25rem 0 0.5rem;
}

.hint {
  font-size: 0.82rem;
  color: var(--ui-text-muted, #6b7280);
}

.ecosystem-footnote {
  font-size: 0.82rem;
  color: var(--ui-text-muted, #6b7280);
  margin-top: 0.5rem;
}

.ecosystem-extra {
  font-size: 0.82rem;
  color: var(--ui-text-600, #475569);
}

.auth-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
</style>
