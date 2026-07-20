<!-- Concurrent edit — 2026-07-20 13:19 CEST — Account consent follow-up: show explicit Terms acceptance, Privacy acknowledgement, and legal version. -->
<template>
  <div class="google-auth">
    <div class="consent-row">
      <UCheckbox
        v-model="consentAcknowledged"
        :aria-label="`Accept Terms of Service version ${FIREUX_ACCOUNT_TERMS_VERSION} and acknowledge Privacy Policy for Google sign-in`"
      />
      <p class="consent-copy">
        I accept the
        <NuxtLink to="/legal/terms">Terms of Service</NuxtLink>
        and acknowledge the
        <NuxtLink to="/legal/privacy">Privacy Policy</NuxtLink>.
        <span class="consent-version">
          Terms and Privacy version {{ FIREUX_ACCOUNT_TERMS_VERSION }}.
        </span>
      </p>
    </div>
    <button
      class="google-btn"
      :disabled="!consentAcknowledged"
      @click="handleGoogleSignIn"
    >
      <img :src="logoSrc" alt="Sign in with Google" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useRouter } from '#imports'
import { useResolvedColorMode } from '../../composables/fireux/app/useColorMode'
import { useAuth } from '../../composables/fireux/firebase/useAuth'
import { FIREUX_ACCOUNT_TERMS_VERSION } from '../../models/core/supporting/user-account-provisioning'

const router = useRouter()
const { signInWithGoogle } = useAuth()
const resolvedMode = useResolvedColorMode()
const isDark = computed(() => resolvedMode.value === 'dark')
const consentAcknowledged = ref(false)

const logoSrc = computed(() =>
  isDark.value
    ? '/img/core/auth/sign-in-dark.svg'
    : '/img/core/auth/sign-in-light.svg'
)

const handleGoogleSignIn = async () => {
  if (!consentAcknowledged.value) return
  const user = await signInWithGoogle(FIREUX_ACCOUNT_TERMS_VERSION)
  if (user?.uid) {
    console.log('[handleGoogleSignIn] ✅ Got UID:', user.uid)
    // Don't automatically create app - let the onboarding flow handle it
    // The main app.vue will show the onboarding modal if app doesn't exist
    router.push('/')
  } else {
    console.warn('[handleGoogleSignIn] ❌ No UID returned from Google sign-in')
  }
}
</script>

<style scoped>
.google-btn {
  border: none;
  background: none;
  cursor: pointer;
  padding: 0;
}
.google-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
.consent-row {
  align-items: flex-start;
  display: flex;
  gap: calc(var(--spacing) * 2);
  margin-bottom: calc(var(--spacing) * 3);
}
.consent-copy {
  color: var(--ui-text-muted);
  font-size: var(--text-sm);
}
.consent-version {
  display: block;
}
</style>
