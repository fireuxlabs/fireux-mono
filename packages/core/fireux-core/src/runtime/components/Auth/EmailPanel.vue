<!-- FILE: packages/core/fireux-core/src/runtime/components/Auth/EmailPanel.vue -->
<template>
  <div class="w-full space-y-5">
    <div
      role="group"
      aria-label="Email account options"
      class="grid grid-cols-2 gap-1 rounded-lg bg-elevated p-1"
    >
      <UButton
        label="Sign in"
        color="neutral"
        :variant="isSignUp ? 'ghost' : 'solid'"
        :aria-pressed="!isSignUp"
        :disabled="formLoading || disabled"
        class="justify-center"
        @click="setMode(false)"
      />
      <UButton
        label="Create account"
        color="neutral"
        :variant="isSignUp ? 'solid' : 'ghost'"
        :aria-pressed="isSignUp"
        :disabled="formLoading || disabled"
        class="justify-center"
        @click="setMode(true)"
      />
    </div>

    <UAuthForm
      class="w-full"
      :fields="fields"
      :submit="{ label: submitLabel, size: 'lg' }"
      :loading="formLoading"
      :disabled="disabled || formLoading"
      @submit="handleEmailSubmit"
    >
      <template #footer>
        <div v-if="error" role="alert" class="space-y-2">
          <UAlert
            :color="error.color"
            variant="subtle"
            :title="error.title"
            :description="error.description"
          />
          <FireCopyError
            :message="`${error.title}: ${error.description}`"
          />
        </div>
      </template>
    </UAuthForm>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from '#imports'
import { useAuth } from '../../composables/fireux/firebase/useAuth'
import { emailSignInFeedback, type SignInFeedback } from './sign-in-feedback'

type AuthMode = 'sign-in' | 'sign-up'

const props = defineProps<{
  defaultMode?: 'sign-in' | 'sign-up'
  disabled?: boolean
}>()
const emit = defineEmits<{ busy: [value: boolean] }>()

const { signInWithEmailPassword, signUpWithEmailPassword } = useAuth()

const isSignUp = ref(props.defaultMode === 'sign-up')
const formLoading = ref(false)
const error = ref<SignInFeedback | null>(null)

function setMode(signUp: boolean) {
  isSignUp.value = signUp
  error.value = null
}

const submitLabel = computed(() =>
  isSignUp.value ? 'Create account' : 'Sign in with email'
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

type AuthFormSubmitLike = {
  data?: {
    name?: string
    email?: string
    password?: string
  }
}

const handleEmailSubmit = async (event?: AuthFormSubmitLike) => {
  if (formLoading.value || props.disabled) return

  const name = String(event?.data?.name ?? '').trim()
  const email = String(event?.data?.email ?? '').trim()
  const password = String(event?.data?.password ?? '')
  const mode: AuthMode = isSignUp.value ? 'sign-up' : 'sign-in'

  if (!email || !password || (mode === 'sign-up' && !name)) {
    error.value = {
      color: 'error',
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
  emit('busy', true)

  let result = null
  try {
    result =
      mode === 'sign-up'
        ? await signUpWithEmailPassword(email, password, name)
        : await signInWithEmailPassword(email, password)
  } catch {
    error.value = emailSignInFeedback(mode === 'sign-up')
  } finally {
    formLoading.value = false
    emit('busy', false)
  }

  if (result?.uid) return
  if (error.value) return
  error.value = emailSignInFeedback(mode === 'sign-up')
}
</script>
