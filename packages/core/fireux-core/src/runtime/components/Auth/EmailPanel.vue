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
        </div>
      </template>
    </UAuthForm>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useRouter } from '#imports'
import { useAuth } from '../../composables/fireux/firebase/useAuth'

type AuthMode = 'sign-in' | 'sign-up'

type AuthError = {
  title: string
  description: string
  hint?: string
} | null

const props = defineProps<{
  brandLabel: string
  defaultMode?: 'sign-in' | 'sign-up'
}>()

const { signInWithEmailPassword, signUpWithEmailPassword } = useAuth()
const router = useRouter()

const isSignUp = ref(props.defaultMode === 'sign-up')
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
  ...(isSignUp.value
    ? [
        {
          name: 'name',
          type: 'text' as const,
          color: 'neutral' as const,
          variant: 'outline' as const,
          label: 'Name',
          placeholder: 'Your name',
          required: true,
          autocomplete: 'name',
          defaultValue: '',
        },
      ]
    : []),
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
    name?: string
    email?: string
    password?: string
  }
}

const handleEmailSubmit = async (event?: AuthFormSubmitLike) => {
  if (formLoading.value) return

  const name = String(event?.data?.name ?? '').trim()
  const email = String(event?.data?.email ?? '').trim()
  const password = String(event?.data?.password ?? '')
  const mode: AuthMode = isSignUp.value ? 'sign-up' : 'sign-in'

  if (!email || !password || (mode === 'sign-up' && !name)) {
    error.value = {
      title: 'Missing information',
      description:
        mode === 'sign-up'
          ? 'Enter your name, email and password to register.'
          : 'Enter your email and password to continue.',
    }
    return
  }
  error.value = null
  formLoading.value = true

  let result = null
  try {
    result =
      mode === 'sign-up'
        ? await signUpWithEmailPassword(email, password, name)
        : await signInWithEmailPassword(email, password)
  } catch (accountError) {
    error.value = {
      title: 'Account setup incomplete',
      description:
        accountError instanceof Error && accountError.message.trim()
          ? accountError.message
          : 'Your signed-in account could not be prepared.',
    }
  } finally {
    formLoading.value = false
  }

  if (result?.uid) {
    if (mode === 'sign-up') {
      await router.push('/users/create')
    }
    return
  }
  if (error.value) return
  setEmailError(mode)
}
</script>
