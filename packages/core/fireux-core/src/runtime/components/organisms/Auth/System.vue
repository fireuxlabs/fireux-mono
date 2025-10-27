<template>
  <UContainer class="center-content">
    <ClientOnly>
      <Transition name="fade">
        <div v-if="authState === 'AUTHENTICATED'" class="auth-central">
          <OrganismsAuthAuthenticated />
        </div>

        <div v-else class="auth-central">
          <section class="auth-shell">
            <UAuthForm
              class="auth-form"
              :title="formTitle"
              :fields="fields"
              :icon="formIcon"
              :separator="separatorLabel"
              :submit="submitButton"
              :loading="formLoading"
              :disabled="formDisabled"
              @submit="onSubmit"
            >
              <template #description>
                <p class="form-description">
                  {{ descriptionMessage }}
                </p>
              </template>

              <template v-if="appLogo" #leading>
                <img
                  :src="appLogo"
                  :alt="`${tenantLabel} logo`"
                  class="app-logo"
                />
              </template>

              <template #providers>
                <UButton
                  block
                  size="lg"
                  variant="ghost"
                  :loading="providerLoading"
                  class="google-button"
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
                  color="amber"
                  variant="subtle"
                  :title="error"
                />
              </template>

              <template v-if="canToggleSignUp" #footer>
                <div class="footer-group">
                  <USwitch v-model="isSignUp" label="Create a new account" />
                  <p v-if="centralSignupUrl" class="hint">
                    Prefer the central portal?
                    <ULink :to="centralSignupUrl" target="_blank"
                      >Open signup</ULink
                    >.
                  </p>
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
import { useAuth } from 'fireux-core/runtime/composables/firebase/useAuth.ts'
import { useFireUXConfig } from '../../../composables/FireUXConfig'

const router = useRouter()
const {
  authState,
  signInWithGoogle,
  signInWithEmailPassword,
  signUpWithEmailPassword,
} = useAuth()
const { role, appName, ecosystem, centralSignupUrl } = useFireUXConfig()

const isTenant = computed(() => role === 'tenant')
const formatBrand = (value?: string) => value?.trim() || ''
const ecosystemLabel = computed(() => formatBrand(ecosystem) || 'FireUX')
const tenantLabel = computed(() => formatBrand(appName) || ecosystemLabel.value)
const appLogo = computed(() => '/img/brand/wordmark.png')

const isSignUp = ref(false)
watch(
  isTenant,
  (tenant) => {
    if (tenant) isSignUp.value = false
  },
  { immediate: true }
)

const formLoading = ref(false)
const providerLoading = ref(false)
const error = ref<string | null>(null)

const canToggleSignUp = computed(() => !isTenant.value)

const formTitle = computed(() =>
  isTenant.value ? `Join ${tenantLabel.value}` : 'Welcome back!'
)

const formIcon = computed(() =>
  isTenant.value ? 'i-lucide-users' : 'i-lucide-lock'
)

const descriptionMessage = computed(() =>
  isTenant.value
    ? `Sign in with your ${ecosystemLabel.value} account to join ${tenantLabel.value}.`
    : `Use your ${ecosystemLabel.value} credentials or create a new ${tenantLabel.value} account below.`
)

const separatorLabel = computed(() => 'or continue with email')

const submitButton = computed(() => ({
  label: isTenant.value || !isSignUp.value ? 'Continue' : 'Create account',
  block: true,
  size: 'lg',
}))

const formDisabled = computed(() => formLoading.value || providerLoading.value)

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

const googleLogo = computed(() => '/img/sign-in-light.svg')

const fields = computed(() => [
  {
    name: 'email',
    type: 'email' as const,
    label: 'Email',
    placeholder: 'name@example.com',
    required: true,
    autocomplete: 'email',
  },
  {
    name: 'password',
    type: 'password' as const,
    label: passwordLabel.value,
    placeholder: passwordPlaceholder.value,
    required: true,
    autocomplete: passwordAutocomplete.value,
  },
])

async function handleGoogle() {
  if (providerLoading.value) return
  providerLoading.value = true
  error.value = null
  try {
    const result = await signInWithGoogle()
    providerLoading.value = false
    if (result?.uid) {
      await router.push('/')
      return
    }
    error.value = 'Google sign-in failed. Please try again.'
  } catch (err) {
    providerLoading.value = false
    error.value =
      err instanceof Error
        ? err.message
        : 'Google sign-in failed. Please try again.'
  }
}

async function onSubmit({ data }: { data?: Record<string, unknown> }) {
  const email = String(data?.email ?? '').trim()
  const password = String(data?.password ?? '')

  if (!email || !password) {
    error.value = 'Enter your email and password.'
    return
  }

  formLoading.value = true
  error.value = null

  const handler =
    !isTenant.value && isSignUp.value
      ? signUpWithEmailPassword
      : signInWithEmailPassword

  try {
    const result = await handler(email, password)
    formLoading.value = false

    if (result?.uid) {
      await router.push('/')
      return
    }

    error.value =
      !isTenant.value && isSignUp.value
        ? 'Sign-up failed. Try a different email.'
        : 'Sign-in failed. Check your details.'
  } catch (err) {
    formLoading.value = false
    error.value =
      err instanceof Error
        ? err.message
        : 'Something went wrong. Please try again.'
  }
}
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

.form-description {
  font-size: 0.95rem;
  color: var(--ui-text-muted);
  text-align: center;
}

.footer-group {
  display: grid;
  gap: var(--space-3);
  justify-items: center;
}

.hint {
  color: var(--ui-text-muted);
  font-size: 0.85rem;
  text-align: center;
}

.google-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: var(--space-2) var(--space-3);
  min-height: 52px;
}

.google-logo {
  height: 32px;
  width: auto;
}

.app-logo {
  height: 36px;
  width: auto;
  margin: 0 auto;
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
