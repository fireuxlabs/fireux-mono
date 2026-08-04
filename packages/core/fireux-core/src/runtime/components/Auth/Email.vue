<!-- Concurrent edit — 2026-07-20 13:19 CEST — Account consent follow-up: show explicit Terms acceptance, Privacy acknowledgement, and legal version. -->
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
      <div v-if="isCreatingAccount" class="consent-row">
        <UCheckbox
          v-model="signupConsentAcknowledged"
          :aria-label="`Accept Terms of Service version ${FIREUX_ACCOUNT_TERMS_VERSION} and acknowledge Privacy Policy for account creation`"
        />
        <p class="hint">
          I accept the
          <NuxtLink to="/legal/terms">Terms of Service</NuxtLink>
          and acknowledge the
          <NuxtLink to="/legal/privacy">Privacy Policy</NuxtLink>.
          <span class="consent-version">
            Terms and Privacy version {{ FIREUX_ACCOUNT_TERMS_VERSION }}.
          </span>
        </p>
      </div>
      <UButton
        type="submit"
        block
        :disabled="isCreatingAccount && !signupConsentAcknowledged"
      >
        {{ submitLabel }}
      </UButton>
      <UAlert
        v-if="errorMessage"
        class="mt-2"
        color="warning"
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

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref, computed, reactive } from 'vue'
import { useAuth } from '../../composables/fireux/firebase/useAuth'
import { useFireUXConfig } from '../../composables/fireux/app/FireUXConfig'
import { FIREUX_ACCOUNT_TERMS_VERSION } from '../../models/operations/user-account-provisioning'

const router = useRouter()
const { signInWithEmailPassword, signUpWithEmailPassword } = useAuth()
const { centralSignupUrl } = useFireUXConfig()

const props = defineProps({
  // 'auto' shows a switch; 'sign-in' enforces sign-in only; 'sign-up' enforces sign-up
  mode: { type: String, default: 'auto' },
})

const isSignUp = ref(props.mode === 'sign-up')
const signupConsentAcknowledged = ref(false)
const state = reactive({
  email: '',
  password: '',
})

const errorTitle = ref('')
const errorMessage = ref('')
const errorHint = ref('')
const signupLink = computed(() => centralSignupUrl || '')
const isCreatingAccount = computed(
  () => props.mode === 'sign-up' || (props.mode === 'auto' && isSignUp.value)
)

const submitLabel = computed(() =>
  props.mode === 'sign-in' || (props.mode === 'auto' && !isSignUp.value)
    ? 'Continue'
    : 'Create Account'
)

const handleEmailAuth = async () => {
  errorTitle.value = ''
  errorMessage.value = ''
  errorHint.value = ''

  const doSignUp = isCreatingAccount.value
  if (doSignUp && !signupConsentAcknowledged.value) {
    errorTitle.value = 'Acceptance required'
    errorMessage.value =
      'Accept the Terms of Service and acknowledge the Privacy Policy before creating an account.'
    return
  }
  let user = null
  try {
    user = doSignUp
      ? await signUpWithEmailPassword(
          state.email,
          state.password,
          FIREUX_ACCOUNT_TERMS_VERSION
        )
      : await signInWithEmailPassword(state.email, state.password)
  } catch (error) {
    errorTitle.value = 'Account setup incomplete'
    errorMessage.value =
      error instanceof Error && error.message.trim()
        ? error.message
        : 'Your signed-in account could not be prepared.'
    return
  }

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
  margin: calc(var(--spacing) * 4) 0;
}
.input-spacing {
  margin-bottom: calc(var(--spacing) * 3);
}
.hint {
  color: var(--ui-text-muted);
  font-size: var(--text-sm);
  margin-top: calc(var(--spacing) * 2);
}
.consent-row {
  align-items: flex-start;
  display: flex;
  gap: calc(var(--spacing) * 2);
  margin: calc(var(--spacing) * 3) 0;
}
.consent-version {
  display: block;
}
</style>
