<!-- FILE: packages/core/fireux-core/src/runtime/components/Auth/EmailPanel.vue -->
<template>
  <div class="w-full space-y-3">
    <p class="font-medium">Sign in or create an account.</p>

    <UAuthForm
      class="w-full"
      :fields="fields"
      :submit="{ label: submitLabel }"
      :loading="formLoading"
      @submit="handleEmailSubmit"
    >
      <template #footer>
        <div class="space-y-3">
          <USwitch
            v-model="isSignUp"
            :label="emailModeLabel"
            :disabled="formLoading"
          />

          <UAlert
            v-if="error"
            color="error"
            variant="subtle"
            :title="error.title"
            :description="error.description"
          />
          <p v-if="error?.hint" class="text-sm text-muted">
            {{ error.hint }}
          </p>
          <p class="text-sm text-muted">
            By signing in, you agree to our
            <NuxtLink to="/legal/terms">Terms of Service</NuxtLink>
            and
            <NuxtLink to="/legal/privacy">Privacy Policy</NuxtLink>.
          </p>
        </div>
      </template>
    </UAuthForm>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAuth } from '../../composables/fireux/firebase/useAuth'

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
const fields = computed(() => [
  {
    name: 'email',
    type: 'email' as const,
    color: 'neutral' as const,
    variant: 'outline' as const,
    label: 'Email',
    placeholder: 'name@example.com',
    required: true,
    autocomplete: 'email',
    defaultValue: '',
  },
  {
    name: 'password',
    type: 'password' as const,
    color: 'neutral' as const,
    variant: 'outline' as const,
    label: passwordLabel.value,
    placeholder: passwordPlaceholder.value,
    required: true,
    autocomplete: passwordAutocomplete.value,
    defaultValue: '',
  },
])

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

type AuthFormSubmitLike = {
  data?: {
    email?: string
    password?: string
  }
}

const handleEmailSubmit = async (event?: AuthFormSubmitLike) => {
  if (formLoading.value) return

  const email = String(event?.data?.email ?? '').trim()
  const password = String(event?.data?.password ?? '')

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
