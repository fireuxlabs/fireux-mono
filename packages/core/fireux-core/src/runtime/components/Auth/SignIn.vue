<template>
  <div class="fx-card-body-stack">
    <div class="fx-card__stack">
      <h1>Your account</h1>
      <p>Sign in or create an account to continue.</p>
    </div>
    <UAlert
      v-if="authUnavailableMessage"
      color="error"
      variant="subtle"
      title="Sign-in is not available"
      :description="authUnavailableMessage"
    />
    <FireCopyError
      v-if="authUnavailableMessage"
      :message="`Sign-in is not available: ${authUnavailableMessage}`"
    />

    <template v-else>
      <UButton
        block
        size="lg"
        color="neutral"
        variant="subtle"
        :loading="providerLoading"
        :disabled="providerLoading || emailLoading"
        icon="i-logos-google-icon"
        @click="handleGoogle"
      >
        {{ providerLoading ? 'Waiting for Google…' : 'Continue with Google' }}
      </UButton>

      <p v-if="providerLoading" role="status">
        Complete sign-in in the Google window.
      </p>
      <div v-if="providerError" role="alert" class="fx-card__stack">
        <UAlert
          :color="providerError.color"
          variant="subtle"
          :title="providerError.title"
          :description="providerError.description"
        />
        <FireCopyError
          :message="`${providerError.title}: ${providerError.description}`"
        />
      </div>

      <USeparator label="or continue with email" />

      <FireAuthEmailPanel
        :default-mode="authMode"
        :disabled="providerLoading"
        @busy="handleEmailBusy"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useRoute } from '#imports'
import { useAuth } from '../../composables/fireux/firebase/useAuth'
import {
  googleSignInFeedback,
  type SignInFeedback,
} from '../../utils/auth/sign-in-feedback'
const route = useRoute()
const { lastBindError, signInWithGoogle } = useAuth()
const providerLoading = ref(false)
const emailLoading = ref(false)
const providerError = ref<SignInFeedback | null>(null)
function handleEmailBusy(busy: boolean) {
  emailLoading.value = busy
  providerError.value = null
}
const authUnavailableMessage = computed(() => {
  const error = lastBindError.value
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: unknown }).code || '')
      : ''
  const message = error instanceof Error ? error.message : String(error || '')
  if (
    code === 'auth/configuration-not-found' ||
    message.includes('CONFIGURATION_NOT_FOUND')
  ) {
    return 'Sign-in hasn’t been set up for this app. Please try again later.'
  }
  return ''
})
const authMode = computed(() =>
  route.query.mode === 'sign-up' ? 'sign-up' : 'sign-in'
)
const handleGoogle = async () => {
  if (providerLoading.value || emailLoading.value) return
  providerError.value = null
  providerLoading.value = true
  try {
    const user = await signInWithGoogle()
    if (!user?.uid) providerError.value = googleSignInFeedback(null)
  } catch (error) {
    providerError.value = googleSignInFeedback(error)
  } finally {
    providerLoading.value = false
  }
}
</script>
