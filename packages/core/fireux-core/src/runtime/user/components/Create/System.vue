<template>
  <ClientOnly>
    <div class="mx-auto min-w-0 w-full max-w-lg px-4 py-8 sm:px-6 sm:py-12">
      <UCard class="min-w-0 overflow-hidden" :ui="{ body: 'p-0 sm:p-0' }">
        <div class="min-w-0">
          <UserCreateIntroduction :app-label="appLabel" />

          <main class="min-w-0 px-6 py-8 sm:px-8">
            <template v-if="isLoading">
              <div
                class="flex min-h-72 flex-col items-center justify-center text-center"
              >
                <UIcon
                  name="i-lucide-loader-circle"
                  class="size-8 animate-spin text-primary"
                />
                <h2 class="mt-4 text-lg font-semibold">
                  Checking your account
                </h2>
                <p class="mt-1 text-sm text-muted">
                  Loading your identity and App access.
                </p>
              </div>
            </template>

            <template v-else-if="readError">
              <div
                class="flex min-h-72 flex-col items-center justify-center text-center"
              >
                <span
                  class="flex size-14 items-center justify-center rounded-full bg-error/10 text-error"
                >
                  <UIcon name="i-lucide-triangle-alert" class="size-7" />
                </span>
                <h2 class="mt-4 text-xl font-semibold">
                  Account setup is unavailable
                </h2>
                <p class="mt-2 max-w-md text-sm leading-6 text-muted">
                  {{ readError }}
                </p>
                <FireCopyError :message="readError" class="mt-4" />
                <UButton
                  class="mt-6"
                  color="neutral"
                  variant="soft"
                  icon="i-lucide-refresh-cw"
                  @click="reloadPage"
                >
                  Try again
                </UButton>
              </div>
            </template>

            <template v-else-if="isSignIn">
              <h2 class="mt-2 text-2xl font-semibold">Sign in to begin</h2>
              <p class="mt-2 text-sm leading-6 text-muted">
                Sign in to continue.
              </p>
              <UButton
                class="mt-8"
                size="lg"
                block
                :to="signInTarget"
                icon="i-lucide-log-in"
              >
                Continue to sign in
              </UButton>
            </template>

            <template v-else-if="requiresUser">
              <div class="flex items-center gap-4 py-2">
                <UAvatar
                  :src="authAvatar || undefined"
                  :alt="displayName"
                  size="xl"
                />
                <div class="min-w-0">
                  <p class="truncate font-semibold text-highlighted">
                    {{ displayName }}
                  </p>
                  <p class="truncate text-sm text-muted">{{ authEmail }}</p>
                </div>
              </div>

              <div class="mt-8">
                <UCheckbox
                  v-model="onboardingConsentAcknowledged"
                  :disabled="isEnsuring"
                  :aria-label="`Accept Terms of Service version ${FIREUX_ACCOUNT_TERMS_VERSION} and acknowledge Privacy Policy`"
                >
                  <template #label>
                    <span class="text-sm leading-6 text-muted">
                      I accept the
                      <NuxtLink
                        class="font-medium text-primary hover:underline"
                        to="/legal/terms"
                        target="_blank"
                        >Terms of Service</NuxtLink
                      >
                      and acknowledge the
                      <NuxtLink
                        class="font-medium text-primary hover:underline"
                        to="/legal/privacy"
                        target="_blank"
                        >Privacy Policy</NuxtLink
                      >.
                    </span>
                  </template>
                </UCheckbox>
              </div>

              <UAlert
                v-if="error"
                class="mt-4"
                color="error"
                variant="subtle"
                icon="i-lucide-circle-alert"
                title="We couldn’t create your profile"
                :description="error"
              />

              <FireCopyError v-if="error" :message="error" class="mt-2" />
              <UButton
                class="mt-6"
                size="lg"
                block
                icon="i-lucide-arrow-right"
                trailing
                :loading="isEnsuring"
                :disabled="isEnsuring || !onboardingConsentAcknowledged"
                @click="handleEnsure"
              >
                {{ isEnsuring ? 'Creating profile…' : 'Continue' }}
              </UButton>
            </template>

            <template v-else-if="requiresApp">
              <h2 class="mt-2 text-2xl font-semibold">
                Connect to {{ appLabel }}
              </h2>
              <p class="mt-2 text-sm leading-6 text-muted">
                Join {{ appLabel }} to continue.
              </p>
              <UAlert
                v-if="error"
                class="mt-6"
                color="error"
                variant="subtle"
                title="We couldn’t connect this App"
                :description="error"
              />
              <FireCopyError v-if="error" :message="error" class="mt-2" />
              <UButton
                class="mt-8"
                size="lg"
                block
                icon="i-lucide-link"
                :loading="isEnsuring"
                :disabled="isEnsuring"
                @click="handleEnsure"
              >
                Connect to {{ appLabel }}
              </UButton>
            </template>

            <template v-else>
              <div
                class="flex min-h-72 flex-col items-center justify-center text-center"
              >
                <span
                  class="flex size-14 items-center justify-center rounded-full bg-success/10 text-success"
                >
                  <UIcon name="i-lucide-check" class="size-7" />
                </span>
                <h2 class="mt-4 text-2xl font-semibold">You’re ready</h2>
                <p class="mt-2 text-sm text-muted">
                  {{ completionDescription }}
                </p>
                <UButton
                  class="mt-6"
                  size="lg"
                  :to="returnTarget"
                  trailing-icon="i-lucide-arrow-right"
                  >Continue</UButton
                >
              </div>
            </template>
          </main>
        </div>
      </UCard>
    </div>

    <template #fallback>
      <div
        class="flex min-h-72 flex-col items-center justify-center text-center"
      >
        <UIcon
          name="i-lucide-loader-circle"
          class="size-8 animate-spin text-primary"
        />
        <h2 class="mt-4 text-lg font-semibold">Checking your account</h2>
      </div>
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
import { useUserBootstrap } from '../../composables/identity/useUserBootstrap'
import { FIREUX_ACCOUNT_TERMS_VERSION } from '../../models/user-account-provisioning'
import { resolveUserOnboardingDestination } from '../../utils/onboarding-route'
const route = useRoute()
const router = useRouter()
const config = useFireUXConfig()
const { appName } = config
const {
  canSelfJoin,
  appPolicyPending,
  appPolicyError,
  appError,
  appOutcome,
  appUser,
  coreError,
  coreOutcome,
  coreUser,
} = useUserSession()
const {
  account,
  error: accountError,
  outcome: accountOutcome,
} = useUserAccount()
const { bootstrapUser } = useUserBootstrap()
const {
  currentUser: authUser,
  hasAuthState,
  isAuthenticated,
  retryAccountProvisioning,
} = useAuth()

const error = ref<string | null>(null)
const isEnsuring = ref(false)
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
    isEnsuring.value = false
    onboardingConsentAcknowledged.value = false
  },
  { flush: 'sync' }
)
const isLoading = computed(() => {
  if (!hasAuthState.value) return true
  if (!isAuthenticated.value) return false
  if (appPolicyPending.value) return true
  if (coreOutcome.value === 'idle' || coreOutcome.value === 'pending')
    return true
  if (accountOutcome.value === 'idle' || accountOutcome.value === 'pending')
    return true
  return (
    canSelfJoin.value &&
    (appOutcome.value === 'idle' || appOutcome.value === 'pending')
  )
})
const readError = computed(() => {
  const cause =
    coreError.value ||
    accountError.value ||
    appPolicyError.value ||
    (canSelfJoin.value ? appError.value : null)
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
const requiresApp = computed(
  () =>
    isAuthenticated.value &&
    Boolean(coreUser.value) &&
    hasCurrentAccount.value &&
    canSelfJoin.value &&
    appOutcome.value === 'empty'
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
const completionDescription = computed(() =>
  appUser.value
    ? `Your User is connected to ${appLabel.value}.`
    : 'Your User is ready.'
)

function reloadPage() {
  window.location.reload()
}

async function handleEnsure() {
  if (isEnsuring.value) return
  const isCurrent = captureIntent()
  const destination = returnTarget.value
  error.value = null
  isEnsuring.value = true
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
    } else if (requiresApp.value) {
      await bootstrapUser()
    }
    if (isCurrent()) await router.replace(destination)
  } catch (cause) {
    if (!isCurrent()) return
    error.value =
      cause instanceof Error
        ? cause.message
        : 'Unable to complete setup. Please try again.'
  } finally {
    if (isCurrent()) isEnsuring.value = false
  }
}
</script>
