<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/Auth/EmailPanel.vue -->
<template>
  <div class="email-panel">
    <p class="status">Sign in or create an account.</p>

    <UForm :state="formState" class="email-form" @submit="handleEmailSubmit">
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
        block
      />
      <div class="switch-row">
        <USwitch
          v-model="isSignUp"
          :label="emailModeLabel"
          :disabled="formLoading"
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
    <p class="legal">
      By signing in, you agree to our
      <NuxtLink to="/legal/terms">Terms of Service</NuxtLink>
      and
      <NuxtLink to="/legal/privacy">Privacy Policy</NuxtLink>.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth.ts'

type AuthMode = 'sign-in' | 'sign-up'

type AuthError = {
  title: string
  description: string
  hint?: string
} | null

const props = defineProps<{ brandLabel: string }>()

const { signInWithEmailPassword, signUpWithEmailPassword } = useAuth()

const isSignUp = ref(false)
const formLoading = ref(false)
const formState = reactive({
  email: '',
  password: '',
})
const error = ref<AuthError>(null)

const submitLabel = computed(() =>
  isSignUp.value ? 'Create account' : 'Continue'
)
const passwordLabel = computed(() =>
  isSignUp.value ? 'Create password' : 'Password'
)
const passwordPlaceholder = computed(() =>
  isSignUp.value ? 'Enter a new password' : 'Enter your password'
)
const passwordAutocomplete = computed(() =>
  isSignUp.value ? 'new-password' : 'current-password'
)
const emailModeLabel = computed(() =>
  isSignUp.value ? 'Creating a new account' : 'Using an existing account'
)

const setEmailError = (mode: AuthMode) => {
  const brand = props.brandLabel
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
          hint: 'Toggle "Create a new account" to continue.',
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

  const mode: AuthMode = isSignUp.value ? 'sign-up' : 'sign-in'

  const result =
    mode === 'sign-up'
      ? await signUpWithEmailPassword(email, password)
      : await signInWithEmailPassword(email, password)

  formLoading.value = false

  if (result?.uid) return

  setEmailError(mode)
}
</script>

<style scoped>
.email-panel {
  margin-top: 1.5rem;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.email-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.status {
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.switch-row {
  margin: 0.75rem 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hint {
  margin-top: 0.25rem;
  font-size: 0.85rem;
  color: #905000;
}

.legal {
  margin-top: 0.25rem;
  font-size: 0.85rem;
  color: #475569;
}

.legal a {
  text-decoration: underline;
}
</style>
