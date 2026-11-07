<template>
  <ClientOnly>
    <UContainer>
      <UCard>
        <template #header>
          <UserCreateIntroduction :app-label="appLabel" />
        </template>
        <div class="fx-card-body-stack">
          <FireState v-if="isLoading" outcome="pending" entity="account" />
          <FireState
            v-else-if="readError"
            outcome="error"
            entity="account"
            :error="readError"
            retryable
            @retry="reloadPage"
          />
          <template v-else-if="isSignIn">
            <h2>Sign in to begin</h2>
            <p>Sign in to continue.</p>
            <UButton size="lg" block :to="signInTarget" icon="i-lucide-log-in">
              Continue to sign in
            </UButton>
          </template>
          <template v-else-if="setupStatus.needsSetup">
            <UUser
              :name="displayName"
              :description="authEmail"
              :avatar="{ src: authAvatar || undefined, alt: displayName }"
              size="lg"
            />
            <p v-if="setupStatus.requiresMembership">
              Continue to join {{ appLabel }}.
            </p>
            <UCheckbox
              v-if="setupStatus.requiresConsent"
              v-model="onboardingConsentAcknowledged"
              :disabled="isCompletingSetup"
              :aria-label="`Accept Terms of Service version ${FIREUX_ACCOUNT_TERMS_VERSION} and acknowledge Privacy Policy`"
            >
              <template #label>
                <span>
                  I accept the
                  <NuxtLink to="/legal#terms" target="_blank"
                    >Terms of Service</NuxtLink
                  >
                  and acknowledge the
                  <NuxtLink to="/legal#privacy" target="_blank"
                    >Privacy Policy</NuxtLink
                  >.
                </span>
              </template>
            </UCheckbox>
            <UAlert
              v-if="error"
              color="error"
              variant="subtle"
              icon="i-lucide-circle-alert"
              title="We couldn’t finish setup"
              :description="error"
            />
            <FireCopyError v-if="error" :message="error" />
            <UButton
              size="lg"
              block
              icon="i-lucide-arrow-right"
              trailing
              :loading="isCompletingSetup"
              :disabled="
                isCompletingSetup ||
                (setupStatus.requiresConsent && !onboardingConsentAcknowledged)
              "
              @click="handleCompleteSetup"
            >
              {{ isCompletingSetup ? 'Finishing setup…' : 'Continue' }}
            </UButton>
          </template>
          <template v-else>
            <UPageFeature
              title="You’re ready"
              :description="completionDescription"
              icon="i-lucide-check"
            />
            <UButton
              size="lg"
              :to="returnTarget"
              trailing-icon="i-lucide-arrow-right"
              >Continue</UButton
            >
          </template>
        </div>
      </UCard>
    </UContainer>
    <template #fallback>
      <FireState outcome="pending" entity="account" />
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, ref, watch, useRoute, useRouter } from '#imports'
import { useCommandScope } from '../../../composables/fireux/commands/useCommandScope'
import { resolveUserAvatarSource } from '../../utils/user-avatar'
import { useFireUXConfig } from '../../../app/composables/config/FireUXConfig'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import { useUserSetup } from '../../composables/account/useUserSetup'
import { FIREUX_ACCOUNT_TERMS_VERSION } from '../../models/user-account-provisioning'
import { resolveUserOnboardingDestination } from '../../utils/auth-redirect'
const route = useRoute()
const router = useRouter()
const config = useFireUXConfig()
const { appName } = config
const { status: setupStatus, error: setupReadError, complete } = useUserSetup()
const { currentUser: authUser, hasAuthState, isAuthenticated } = useAuth()

const error = ref<string | null>(null)
const isCompletingSetup = ref(false)
const onboardingConsentAcknowledged = ref(false)
const intentSources = [
  () => authUser.value?.uid,
  () => config.appId,
  () => route.fullPath,
]
const captureIntent = useCommandScope(intentSources)
watch(
  intentSources,
  () => {
    error.value = null
    isCompletingSetup.value = false
    onboardingConsentAcknowledged.value = false
  },
  { flush: 'sync' }
)
const isLoading = computed(() => setupStatus.value.pending)
const readError = computed(() => {
  const cause = setupReadError.value
  if (!cause) return ''
  return cause instanceof Error && cause.message.trim()
    ? cause.message.trim()
    : 'Your account could not be loaded. Please try again.'
})
const isSignIn = computed(() => hasAuthState.value && !isAuthenticated.value)
const appLabel = computed(() => appName || 'this App')
const authEmail = computed(() => authUser.value?.email || 'Signed-in account')
const authAvatar = computed(() =>
  resolveUserAvatarSource(authUser.value?.photoURL)
)
const displayName = computed(
  () =>
    authUser.value?.displayName?.trim() ||
    authEmail.value.split('@')[0] ||
    'New User'
)
const signInTarget = computed(
  () => `/auth?redirect=${encodeURIComponent(returnTarget.value)}`
)
const returnTarget = computed(() =>
  resolveUserOnboardingDestination(route.query.redirect)
)
const completionDescription = 'Your account is ready.'

function reloadPage() {
  window.location.reload()
}

async function handleCompleteSetup() {
  if (
    isCompletingSetup.value ||
    setupStatus.value.pending ||
    setupStatus.value.failed ||
    !isAuthenticated.value
  )
    return
  const isCurrent = captureIntent()
  const destination = returnTarget.value
  error.value = null
  isCompletingSetup.value = true
  try {
    if (setupStatus.value.needsSetup) {
      if (
        setupStatus.value.requiresConsent &&
        !onboardingConsentAcknowledged.value
      )
        throw new Error(
          'Accept the Terms of Service and acknowledge the Privacy Policy to continue.'
        )
      const provisioned = await complete(
        setupStatus.value.requiresConsent
          ? FIREUX_ACCOUNT_TERMS_VERSION
          : undefined
      )
      if (!provisioned)
        throw new Error('Setup could not be completed. Please try again.')
    }
    if (isCurrent()) await router.replace(destination)
  } catch (cause) {
    if (!isCurrent()) return
    error.value =
      cause instanceof Error
        ? cause.message
        : 'Unable to complete setup. Please try again.'
  } finally {
    if (isCurrent()) isCompletingSetup.value = false
  }
}
</script>
