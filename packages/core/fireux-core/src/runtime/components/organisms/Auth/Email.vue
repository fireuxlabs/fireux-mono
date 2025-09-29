<template>
  <div class="email-auth">
    <UForm :state="state" class="form" @submit="handleEmailAuth">
      <UInput v-model="state.email" placeholder="Email" block />
      <div class="input-spacing" />
      <UInput
        v-model="state.password"
        type="password"
        placeholder="Password"
        block
      />
      <div v-if="mode === 'auto'" class="switch-container">
        <USwitch
          v-model="isSignUp"
          :label="isSignUp ? 'Signing Up' : 'Signing In'"
        />
      </div>
      <UButton type="submit" block>
        {{ submitLabel }}
      </UButton>
      <UAlert
        v-if="errorMessage"
        class="mt-2"
        color="amber"
        variant="subtle"
        :title="errorTitle"
        :description="errorMessage"
      />
      <p v-if="errorHint" class="hint">
        {{ errorHint }}
        <template v-if="signupLink">
          <NuxtLink :to="signupLink">Create one here</NuxtLink>.
        </template>
      </p>
    </UForm>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref, computed, reactive } from 'vue'

const router = useRouter()
const { signInWithEmailPassword, signUpWithEmailPassword } = useAuth()
const { centralSignupUrl } = useFireUXConfig()

const props = defineProps({
  // 'auto' shows a switch; 'sign-in' enforces sign-in only; 'sign-up' enforces sign-up
  mode: { type: String, default: 'auto' },
})

const isSignUp = ref(props.mode === 'sign-up')
const state = reactive({
  email: '',
  password: '',
})

const errorTitle = ref('')
const errorMessage = ref('')
const errorHint = ref('')
const signupLink = computed(() => centralSignupUrl || '')

const submitLabel = computed(() =>
  props.mode === 'sign-in' || (props.mode === 'auto' && !isSignUp.value)
    ? 'Continue'
    : 'Create Account'
)

const handleEmailAuth = async () => {
  errorTitle.value = ''
  errorMessage.value = ''
  errorHint.value = ''

  const doSignUp =
    props.mode === 'sign-up' || (props.mode === 'auto' && isSignUp.value)
  const authMethod = doSignUp
    ? signUpWithEmailPassword
    : signInWithEmailPassword

  const user = await authMethod(state.email, state.password)

  if (user?.uid) {
    console.log('[handleEmailAuth] ✅ Got UID:', user.uid)
    router.push('/')
  } else {
    // Friendly guidance for common cases
    errorTitle.value = doSignUp
      ? 'Account may already exist'
      : 'No account found'
    errorMessage.value = doSignUp
      ? 'Looks like you might already have a Misebox account with this email.'
      : 'We couldn’t find a Misebox account with that email.'
    errorHint.value = doSignUp
      ? 'Try signing in instead.'
      : 'Would you like to create a new Misebox account?'
  }
}
</script>
<style scoped>
.switch-container {
  margin: var(--space-4) 0;
}
.input-spacing {
  margin-bottom: var(--space-3);
}
.hint {
  color: var(--ui-text-muted);
  font-size: 0.9rem;
  margin-top: var(--space-2);
}
</style>
