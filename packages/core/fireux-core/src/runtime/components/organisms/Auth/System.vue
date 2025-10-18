<template>
  <UContainer class="center-content">
    <ClientOnly>
      <Transition name="fade">
        <div>
          <div v-if="authState === 'AUTHENTICATED'">
            <OrganismsAuthAuthenticated />
          </div>

          <div v-else class="auth-central">
            <div class="auth-shell">
              <UAuthForm
                class="auth-form"
                :title="formTitle"
                :fields="fields"
                :separator="separatorLabel"
                :submit="submitButton"
                :icon="formIcon"
                :loading="formLoading"
                :disabled="formDisabled"
                @submit="onSubmit"
              >
                <template #providers>
                  <button
                    type="button"
                    class="google-button"
                    :disabled="providerLoading"
                    :aria-busy="providerLoading"
                    aria-label="Continue with Google"
                    @click="handleGoogle"
                  >
                    <img
                      :src="googleLogo"
                      alt="Continue with Google"
                      class="google-logo"
                    />
                    <span v-if="providerLoading" class="sr-only">Loading</span>
                  </button>
                </template>
                <template #description>
                  <p class="form-description">
                    <span v-if="isTenant">
                      Sign in with your {{ signInBrand }} account to join
                      <strong>{{ appName }}</strong
                      >.
                    </span>
                    <span v-else>
                      Use your {{ signInBrand }} credentials or create a new
                      account below.
                    </span>
                  </p>
                </template>

                <template #validation>
                  <UAlert
                    v-if="error"
                    color="amber"
                    variant="subtle"
                    :title="error.title"
                    :description="error.description"
                  />
                  <p v-if="error?.hint" class="hint">
                    {{ error.hint }}
                  </p>
                </template>

                <template v-if="!isTenant" #footer>
                  <div class="footer-group">
                    <USwitch v-model="isSignUp" label="Create a new account" />
                    <p v-if="centralSignupUrl" class="hint">
                      Prefer the central signup?
                      <ULink :to="centralSignupUrl" target="_blank">
                        Open portal </ULink
                      >.
                    </p>
                  </div>
                </template>

                <template v-else #footer>
                  <p class="hint">
                    Need access? Ask your {{ signInBrand }} administrator to
                    invite you.
                  </p>
                </template>
              </UAuthForm>
            </div>
          </div>
        </div>
      </Transition>
    </ClientOnly>
  </UContainer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useNuxtApp } from 'nuxt/app'

import { useAuth } from '../../../composables/firebase/useAuth'
import { useFireUXConfig } from '../../../composables/FireUXConfig'
import {
  useAuthUiDebugState,
  type AuthUiDebugMode,
} from '../../../composables/state/useAuthUiDebugState'

const router = useRouter()
const {
  authState,
  signInWithGoogle,
  signInWithEmailPassword,
  signUpWithEmailPassword,
} = useAuth()
const { role, appName, centralSignupUrl, ecosystem } = useFireUXConfig()
const { authUiDebug } = useAuthUiDebugState()

const isTenant = computed(() => role === 'tenant')
const isSignUp = ref(false)
const lastEvent = ref('idle')

watch(
  () => isTenant.value,
  (tenant) => {
    if (tenant) isSignUp.value = false
  },
  { immediate: true }
)

const formLoading = ref(false)
const providerLoading = ref(false)

type AuthError = {
  title: string
  description: string
  hint?: string
}

const error = ref<AuthError | null>(null)

const authMode = computed<AuthUiDebugMode>(() =>
  !isTenant.value && isSignUp.value ? 'sign-up' : 'sign-in'
)

const toBrandLabel = (value: string) => {
  const lower = value.toLowerCase()
  if (lower === 'fireux') return 'FireUX'
  return value
    .split(/[-_]/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

const ecosystemLabel = computed(() => toBrandLabel(ecosystem))
const signInBrand = computed(() =>
  isTenant.value ? ecosystemLabel.value : appName
)

const nuxtApp = useNuxtApp()
const colorMode = nuxtApp.$colorMode as { value: string } | undefined
const googleLogo = computed(() =>
  colorMode?.value === 'dark'
    ? '/img/sign-in-dark.svg'
    : '/img/sign-in-light.svg'
)

const formIcon = computed(() =>
  isTenant.value ? 'i-lucide-users' : 'i-lucide-lock'
)
const formTitle = computed(() =>
  isTenant.value ? `Join ${appName}` : 'Welcome back!'
)
const separatorLabel = computed(() => 'or continue with email')
const formDescription = computed(() =>
  isTenant.value
    ? `Sign in with your ${signInBrand.value} account to join ${appName}.`
    : `Use your ${signInBrand.value} credentials or create a new account below.`
)

const passwordLabel = computed(() => {
  if (isTenant.value) return 'Password'
  return isSignUp.value ? 'Create password' : 'Password'
})

const passwordPlaceholder = computed(() =>
  isSignUp.value ? 'At least 8 characters' : 'Enter your password'
)

const passwordAutocomplete = computed(() =>
  isSignUp.value ? 'new-password' : 'current-password'
)

type AuthField = {
  name: string
  type: 'email' | 'password'
  label: string
  placeholder: string
  required: boolean
  autocomplete: string
}

const fields = computed<AuthField[]>(() => [
  {
    name: 'email',
    type: 'email',
    label: 'Email',
    placeholder: 'name@example.com',
    required: true,
    autocomplete: 'email',
  },
  {
    name: 'password',
    type: 'password',
    label: passwordLabel.value,
    placeholder: passwordPlaceholder.value,
    required: true,
    autocomplete: passwordAutocomplete.value,
  },
])

const submitButton = computed(() => ({
  label: isTenant.value || !isSignUp.value ? 'Continue' : 'Create account',
  block: true,
  size: 'lg',
}))

const formDisabled = computed(() => formLoading.value || providerLoading.value)

const updateDebugSnapshot = () => {
  authUiDebug.value = {
    isTenant: isTenant.value,
    mode: authMode.value,
    formTitle: formTitle.value,
    description: formDescription.value,
    brandLabel: signInBrand.value,
    submitLabel: submitButton.value.label,
    separatorLabel: separatorLabel.value,
    isSignUpToggle: isSignUp.value,
    formLoading: formLoading.value,
    providerLoading: providerLoading.value,
    lastEvent: lastEvent.value,
    errorTitle: error.value?.title,
    errorDescription: error.value?.description,
    errorHint: error.value?.hint,
  }
}

const setEmailError = (mode: 'sign-in' | 'sign-up') => {
  const brand = signInBrand.value
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
          hint: centralSignupUrl
            ? 'Toggle "Create a new account" below or open the central portal.'
            : 'Toggle "Create a new account" below to continue.',
        }
  updateDebugSnapshot()
}

const handleGoogle = async () => {
  if (providerLoading.value) return
  lastEvent.value = 'google-click'
  providerLoading.value = true
  error.value = null
  updateDebugSnapshot()

  const user = await signInWithGoogle()
  if (user?.uid) {
    lastEvent.value = 'google-success'
    await router.push('/')
  } else {
    lastEvent.value = 'google-failed'
    error.value = {
      title: 'Google sign-in failed',
      description: 'Please try again or continue with email.',
    }
  }

  providerLoading.value = false
  updateDebugSnapshot()
}

type FormValues = {
  email?: string
  password?: string
}

const onSubmit = async ({ data }: { data?: FormValues }) => {
  const email = String(data?.email ?? '').trim()
  const password = String(data?.password ?? '')

  if (!email || !password) {
    error.value = {
      title: 'Missing information',
      description: 'Enter your email and password to continue.',
    }
    updateDebugSnapshot()
    return
  }

  error.value = null
  formLoading.value = true
  lastEvent.value =
    authMode.value === 'sign-up' ? 'submit-sign-up' : 'submit-sign-in'
  updateDebugSnapshot()

  const submitMode: 'sign-in' | 'sign-up' =
    !isTenant.value && isSignUp.value ? 'sign-up' : 'sign-in'

  const result =
    submitMode === 'sign-up'
      ? await signUpWithEmailPassword(email, password)
      : await signInWithEmailPassword(email, password)

  if (result?.uid) {
    lastEvent.value = 'submit-success'
    await router.push('/')
    formLoading.value = false
    updateDebugSnapshot()
    return
  }

  setEmailError(submitMode)
  formLoading.value = false
  lastEvent.value = 'submit-failed'
  updateDebugSnapshot()
}

watch(
  [
    isTenant,
    isSignUp,
    formLoading,
    providerLoading,
    submitButton,
    separatorLabel,
    formTitle,
    formDescription,
  ],
  () => updateDebugSnapshot(),
  { immediate: true }
)

watch(error, () => updateDebugSnapshot(), { deep: true })
watch(lastEvent, () => updateDebugSnapshot())
</script>

<style scoped>
.center-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: var(--space-10) var(--space-4);
}

.auth-central {
  display: flex;
  justify-content: center;
  width: 100%;
}

.auth-shell {
  width: 100%;
  max-width: 420px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  border-radius: var(--radius-xl);
  background-color: var(--ui-bg);
  padding: var(--space-10) var(--space-8);
  box-shadow: var(--shadow-sm);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.form-description {
  font-size: 0.95rem;
  color: var(--ui-text-muted);
}

.footer-group {
  display: grid;
  gap: var(--space-2);
  justify-items: center;
}

.hint {
  color: var(--ui-text-muted);
  font-size: 0.85rem;
  text-align: center;
}

.google-button {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  position: relative;
}

.google-button:disabled,
.google-button[aria-busy='true'] {
  cursor: wait;
  opacity: 0.7;
}

.google-button:focus-visible {
  outline: 2px solid var(--ui-primary);
  outline-offset: 4px;
  border-radius: 999px;
}

.google-logo {
  display: block;
  max-width: 100%;
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

/* Fade transition styles */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.6s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
