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
          <template v-else-if="requiresUser">
            <UUser
              :name="displayName"
              :description="authEmail"
              :avatar="{ src: authAvatar || undefined, alt: displayName }"
              size="lg"
            />
            <UCheckbox
              v-model="onboardingConsentAcknowledged"
              :disabled="isCreatingUser"
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
              title="We couldn’t create your profile"
              :description="error"
            />
            <FireCopyError v-if="error" :message="error" />
            <UButton
              size="lg"
              block
              icon="i-lucide-arrow-right"
              trailing
              :loading="isCreatingUser"
              :disabled="isCreatingUser || !onboardingConsentAcknowledged"
              @click="handleCreateUser"
            >
              {{ isCreatingUser ? 'Creating profile…' : 'Continue' }}
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
import { useUserSession } from '../../composables/session/useUserSession'
import { useUserAccount } from '../../composables/account/useUserAccount'
import { FIREUX_ACCOUNT_TERMS_VERSION } from '../../models/user-account-provisioning'
import { resolveUserOnboardingDestination } from '../../utils/onboarding-route'
const route = useRoute()
const router = useRouter()
const config = useFireUXConfig()
const { appName } = config
const { coreError, coreOutcome, coreUser } = useUserSession()
const {
  account,
  error: accountError,
  outcome: accountOutcome,
} = useUserAccount()
const {
  currentUser: authUser,
  hasAuthState,
  isAuthenticated,
  retryAccountProvisioning,
} = useAuth()

const error = ref<string | null>(null)
const isCreatingUser = ref(false)
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
    isCreatingUser.value = false
    onboardingConsentAcknowledged.value = false
  },
  { flush: 'sync' }
)
const isLoading = computed(() => {
  if (!hasAuthState.value) return true
  if (!isAuthenticated.value) return false
  if (coreOutcome.value === 'idle' || coreOutcome.value === 'pending')
    return true
  if (accountOutcome.value === 'idle' || accountOutcome.value === 'pending')
    return true
  return false
})
const readError = computed(() => {
  const cause = coreError.value || accountError.value
  if (!cause) return ''
  return cause instanceof Error && cause.message.trim()
    ? cause.message.trim()
    : 'Your User records could not be loaded. Please try again.'
})
const isSignIn = computed(() => hasAuthState.value && !isAuthenticated.value)
const hasCurrentAccount = computed(
  () =>
    accountOutcome.value === 'ready' &&
    account.value?.terms.version === FIREUX_ACCOUNT_TERMS_VERSION &&
    account.value.terms.accepted_at != null
)
const requiresUser = computed(
  () => isAuthenticated.value && (!coreUser.value || !hasCurrentAccount.value)
)
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

async function handleCreateUser() {
  if (isCreatingUser.value) return
  const isCurrent = captureIntent()
  const destination = returnTarget.value
  error.value = null
  isCreatingUser.value = true
  try {
    if (requiresUser.value) {
      if (!onboardingConsentAcknowledged.value)
        throw new Error(
          'Accept the Terms of Service and acknowledge the Privacy Policy to continue.'
        )
      const provisioned = await retryAccountProvisioning(
        FIREUX_ACCOUNT_TERMS_VERSION
      )
      if (!provisioned)
        throw new Error('Your User could not be created. Please try again.')
    }
    if (isCurrent()) await router.replace(destination)
  } catch (cause) {
    if (!isCurrent()) return
    error.value =
      cause instanceof Error
        ? cause.message
        : 'Unable to complete setup. Please try again.'
  } finally {
    if (isCurrent()) isCreatingUser.value = false
  }
}
</script>
