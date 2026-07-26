<!-- FILE: packages/core/fireux-core/src/runtime/components/Auth/System.vue -->
<!-- Concurrent edit — 2026-07-20 13:19 CEST — Account consent follow-up: show explicit Terms acceptance, Privacy acknowledgement, and legal version. -->
<template>
  <div class="w-full">
    <UCard class="w-full">
      <div class="space-y-4">
        <div class="flex w-full justify-center" aria-label="Brand wordmark">
          <AppBrandWordmark
            v-if="!isTenantApp"
            size="large"
            class="h-16 w-auto max-w-full object-contain"
          />
          <AppBrandWordmark
            v-else
            size="medium"
            :light-src="ecosystemWordmarkLight"
            :dark-src="ecosystemWordmarkDark"
            :alt="ecosystemBrandAlt"
            class="h-10 w-auto max-w-40 object-contain"
          />
        </div>

        <template v-if="isAuthenticated">
          <div class="w-full space-y-4">
            <UAlert
              v-if="showCompletion"
              color="success"
              variant="subtle"
              :title="authCompletionTitle"
              :description="authCompletionDescription"
            />
            <UAlert
              v-if="accountProvisionErrorMessage"
              color="error"
              variant="subtle"
              title="Account setup incomplete"
              :description="accountProvisionErrorMessage"
            />
            <UButton
              v-if="accountProvisionErrorMessage"
              block
              color="primary"
              variant="soft"
              :loading="creatingUser"
              @click="handleAccountRetry"
            >
              Retry account setup
            </UButton>
            <AuthOnboarding
              v-else-if="showOnboarding"
              :title="authOnboarding!.title"
              :description="authOnboarding!.description"
              :complete-label="authOnboarding!.completeLabel"
              :skip-label="authOnboarding!.skipLabel"
              :loading="onboardingLoading"
              :error="onboardingError"
              @submit="handleOnboarding"
            />
            <UAlert
              v-else-if="membershipLoading"
              color="neutral"
              variant="soft"
              title="Registrierig wird vorbereitet"
              :description="`Agmäldet aus ${authIdentityLabel}.`"
            />

            <UserCardsPill
              v-else-if="!showCompletion && currentUserPill"
              v-bind="currentUserPill"
              :link="Boolean(currentUserPill && currentUserPill.to)"
              :show-badges="false"
            />

            <div
              v-if="!showOnboarding && !membershipLoading"
              class="flex w-full flex-col gap-3"
            >
              <UButton
                block
                color="primary"
                :disabled="creatingUser || Boolean(accountProvisionErrorMessage)"
                @click="goToCompletion"
              >
                {{ authenticatedPrimaryLabel }}
              </UButton>
              <UButton
                block
                variant="ghost"
                :loading="signOutLoading"
                @click="handleSignOut"
              >
                Sign out
              </UButton>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="flex items-start gap-2">
            <UCheckbox
              v-model="googleConsentAcknowledged"
              :aria-label="`Accept Terms of Service version ${FIREUX_ACCOUNT_TERMS_VERSION} and acknowledge Privacy Policy for Google sign-in`"
              :disabled="providerLoading"
            />
            <p class="text-sm text-muted">
              I accept the
              <NuxtLink to="/legal/terms">Terms of Service</NuxtLink>
              and acknowledge the
              <NuxtLink to="/legal/privacy">Privacy Policy</NuxtLink>.
              <span class="block">
                Terms and Privacy version {{ FIREUX_ACCOUNT_TERMS_VERSION }}.
              </span>
            </p>
          </div>

          <UButton
            block
            color="neutral"
            variant="subtle"
            :loading="providerLoading"
            :disabled="providerLoading || !googleConsentAcknowledged"
            icon="i-logos-google-icon"
            @click="handleGoogle"
          >
            Continue with Google
          </UButton>

          <UAlert
            v-if="providerError"
            color="error"
            variant="subtle"
            title="Account setup incomplete"
            :description="providerError"
          />

          <USeparator label="or continue with email" />

          <AuthEmailPanel
            :brand-label="ecosystemLabel"
            :default-mode="config.authDefaultMode"
          />
        </template>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useRoute, useRouter, watch } from '#imports'
import { useFireUXConfig } from '../../composables/fireux/app/FireUXConfig'
import { useAuth } from '../../composables/fireux/firebase/useAuth'
import { useUser } from '../../composables/fireux/firestore/core/user/useUser'
import { useUserInterface } from '../../composables/fireux/firestore/core/user/utils/view/useUserInterface'
import { FIREUX_ACCOUNT_TERMS_VERSION } from '../../models/core/supporting/user-account-provisioning'

const router = useRouter()
const route = useRoute()
const {
  authState,
  hasAuthState,
  signOutUser,
  signInWithGoogle,
  currentUser: authUser,
  creating: creatingUser,
  lastAccountProvisionError,
  retryAccountProvisioning,
} = useAuth()
const isAuthenticated = computed(() => authState.value === 'AUTHENTICATED')
const signOutLoading = ref(false)
const providerLoading = ref(false)
const providerError = ref('')
const onboardingLoading = ref<'' | 'completed' | 'skipped'>('')
const onboardingError = ref('')
const submittedOnboardingStatus = ref<'' | 'completed' | 'skipped'>('')
const navigationInFlight = ref(false)
const googleConsentAcknowledged = ref(false)
const accountProvisionErrorMessage = computed(() => {
  const error = lastAccountProvisionError.value
  if (!error) return ''

  const message = error instanceof Error ? error.message.trim() : String(error)
  if (message.includes('canonical backfill')) {
    return 'We’re getting your account ready. Your login details are safe — please try again shortly.'
  }

  return message || 'Your signed-in account could not be prepared.'
})

const config = useFireUXConfig()
const ecosystemLabel = config.ecosystem
const isTenantApp = computed(() => config.isTenant)
const ecosystemBrandLabel = computed(() =>
  ecosystemLabel === 'misebox' ? 'Misebox' : ecosystemLabel
)
const ecosystemBrandAlt = computed(() => `${ecosystemBrandLabel.value} ecosystem`)
const ecosystemWordmarkLight = '/img/ecosystem/wordmark-light.svg'
const ecosystemWordmarkDark = '/img/ecosystem/wordmark-dark.svg'

const {
  currentUser,
  appUser,
  appPending,
  appOutcome,
  app: appUpdates,
} = useUser()
const { membership } = appUpdates
const { pill: userInterface } = useUserInterface()
const currentUserPill = computed(() =>
  currentUser.value ? userInterface(currentUser.value) : null
)
const authIdentityLabel = computed(() =>
  String(authUser.value?.displayName || authUser.value?.email || authUser.value?.uid || 'unknown')
)

function sanitizeRedirect(value: unknown): string | null {
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== 'string') return null
  const trimmed = raw.trim()
  if (!trimmed.startsWith('/')) return null
  if (trimmed.startsWith('//')) return null
  return trimmed
}

const authCompletion = computed(() => config.authCompletion)
const authOnboarding = computed(() => config.authOnboarding)
const onboardingStatus = computed(
  () =>
    submittedOnboardingStatus.value ||
    appUser.value?.onboarding_status ||
    'pending'
)
const membershipLoading = computed(
  () =>
    Boolean(authOnboarding.value) &&
    (appPending.value || appOutcome.value === 'pending' || appOutcome.value === 'idle')
)
const showOnboarding = computed(
  () =>
    Boolean(authOnboarding.value) &&
    !membershipLoading.value &&
    appOutcome.value === 'ready' &&
    onboardingStatus.value === 'pending' &&
    !accountProvisionErrorMessage.value
)
const showCompletion = computed(
  () =>
    Boolean(authCompletion.value) &&
    (!authOnboarding.value || onboardingStatus.value === 'completed')
)
const authCompletionTitle = computed(
  () => authCompletion.value?.title || 'Thanks for registering!'
)
const authCompletionDescription = computed(
  () => authCompletion.value?.description || 'We’re taking you to the next page.'
)
const authenticatedPrimaryLabel = computed(() =>
  authCompletion.value?.actionLabel ||
  (authCompletion.value ? 'Continue' : 'Go to dashboard')
)
const completionDelay = computed(() => {
  const delay = authCompletion.value?.delayMs
  return typeof delay === 'number' && Number.isFinite(delay)
    ? Math.min(Math.max(delay, 0), 10_000)
    : 0
})
const completionPath = computed(
  () => sanitizeRedirect(authCompletion.value?.path) ?? '/dashboard'
)
const resolvedPostAuthPath = computed(
  () => sanitizeRedirect(route.query.redirect) ?? completionPath.value
)

async function completeAuthNavigation(target: string, showDelay = true) {
  if (navigationInFlight.value) return
  navigationInFlight.value = true
  if (showDelay && completionDelay.value > 0 && authCompletion.value) {
    await new Promise(resolve => setTimeout(resolve, completionDelay.value))
  }
  await router.replace(target).catch(() => {})
}

watch(
  () =>
    [
      route.path,
      hasAuthState.value,
      isAuthenticated.value,
      resolvedPostAuthPath.value,
      creatingUser.value,
      lastAccountProvisionError.value,
      appPending.value,
      appOutcome.value,
      onboardingStatus.value,
    ] as const,
  async ([
    path,
    authReady,
    authenticated,
    target,
    creating,
    accountError,
    membershipPending,
    membershipOutcome,
    status,
  ]: readonly [
    string,
    boolean,
    boolean,
    string,
    boolean,
    unknown,
    boolean,
    string,
    string,
  ]) => {
    if (path !== '/auth') return
    if (!authReady || !authenticated) return
    if (creating) return
    if (accountError) return
    if (authOnboarding.value) {
      if (membershipPending || membershipOutcome !== 'ready') return
      if (status === 'pending') return
      await completeAuthNavigation(target, status === 'completed')
      return
    }
    await completeAuthNavigation(target)
  },
  { immediate: true }
)

const goToCompletion = async () => {
  await router.push(resolvedPostAuthPath.value).catch(() => {})
}

const handleSignOut = async () => {
  if (signOutLoading.value) return
  signOutLoading.value = true
  try {
    await signOutUser('/auth')
  } finally {
    signOutLoading.value = false
  }
}

const handleAccountRetry = async () => {
  await retryAccountProvisioning().catch(() => {})
}

const handleOnboarding = async (status: 'completed' | 'skipped') => {
  if (onboardingLoading.value) return
  onboardingError.value = ''
  onboardingLoading.value = status
  try {
    await membership.setOnboardingStatus(status)
    submittedOnboardingStatus.value = status
    await completeAuthNavigation(
      resolvedPostAuthPath.value,
      status === 'completed'
    )
  } catch (error) {
    onboardingError.value =
      error instanceof Error && error.message.trim()
        ? error.message
        : 'D Registrierig het nid chönne gspeicheret wärde.'
  } finally {
    onboardingLoading.value = ''
  }
}

const handleGoogle = async () => {
  if (providerLoading.value || !googleConsentAcknowledged.value) return
  providerError.value = ''
  providerLoading.value = true
  try {
    await signInWithGoogle(FIREUX_ACCOUNT_TERMS_VERSION)
  } catch (error) {
    providerError.value =
      error instanceof Error && error.message.trim()
        ? error.message
        : 'Your signed-in account could not be prepared.'
  } finally {
    providerLoading.value = false
  }
}

</script>
