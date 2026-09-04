<template>
  <ClientOnly>
    <div class="mx-auto min-w-0 w-full max-w-4xl py-6 sm:py-10">
      <UserCreateProgress :steps="steps" :active-step="activeStep" />

      <UCard class="min-w-0 overflow-hidden" :ui="{ body: 'p-0 sm:p-0' }">
        <div class="grid min-w-0 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <UserCreateIntroduction
            :app-label="appLabel"
            :ecosystem-label="ecosystemLabel"
            :benefits="benefits"
          />

          <main class="min-w-0 p-5 sm:p-8">
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
              <p class="text-sm font-medium text-primary">Step 1 of 3</p>
              <h2 class="mt-2 text-2xl font-semibold">Sign in to begin</h2>
              <p class="mt-2 text-sm leading-6 text-muted">
                Your login protects the User you create next.
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
              <p class="text-sm font-medium text-primary">Step 2 of 3</p>
              <h2 class="mt-2 text-2xl font-semibold">Meet your new User</h2>
              <p class="mt-2 text-sm leading-6 text-muted">
                This is how you’ll appear in {{ appLabel }}. You can edit your
                profile after setup.
              </p>

              <div
                class="mt-6 flex items-center gap-4 rounded-xl border border-default bg-elevated/40 p-4"
              >
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
                  <UBadge class="mt-2" color="neutral" variant="soft" size="sm"
                    >Public profile</UBadge
                  >
                </div>
              </div>

              <div class="mt-6 rounded-xl border border-default p-4">
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
                <p class="mt-2 pl-7 text-xs text-dimmed">
                  Version {{ FIREUX_ACCOUNT_TERMS_VERSION }}
                </p>
              </div>

              <UAlert
                v-if="error"
                class="mt-4"
                color="error"
                variant="subtle"
                icon="i-lucide-circle-alert"
                title="We couldn’t create your User"
                :description="error"
              />

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
                {{ isEnsuring ? 'Creating your User…' : 'Create my User' }}
              </UButton>
              <p class="mt-3 text-center text-xs text-dimmed">
                Your profile starts with the ecosystem avatar. You can replace
                it later.
              </p>
            </template>

            <template v-else-if="requiresApp">
              <p class="text-sm font-medium text-primary">Step 3 of 3</p>
              <h2 class="mt-2 text-2xl font-semibold">
                Connect to {{ appLabel }}
              </h2>
              <p class="mt-2 text-sm leading-6 text-muted">
                Your User is ready. Complete this App’s membership to open its
                available features.
              </p>
              <UAlert
                v-if="error"
                class="mt-6"
                color="error"
                variant="subtle"
                title="We couldn’t connect this App"
                :description="error"
              />
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
import { computed, ref, useRoute, useRouter } from '#imports'
import { useFireUXConfig } from '../../../app/composables/config/FireUXConfig'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import { useUser } from '../../composables/useUser'
import { useUserBootstrap } from '../../composables/firestore/mutations/useUserCreate'
import { FIREUX_ACCOUNT_TERMS_VERSION } from '../../models/user-account-provisioning'
import { resolveUserOnboardingDestination } from '../../../utils/onboarding-route'

const route = useRoute()
const router = useRouter()
const { appName, ecosystem, selfJoinEnabled } = useFireUXConfig()
const {
  appError,
  appOutcome,
  appUser,
  coreError,
  coreOutcome,
  coreUser,
  accountError,
  accountOutcome,
  account,
} = useUserSession()
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
const steps = computed(() => [
  { label: 'Sign in' },
  { label: 'Create User' },
  ...(selfJoinEnabled ? [{ label: 'Connect' }] : []),
])
const benefits = [
  {
    icon: 'i-lucide-contact',
    label: 'Public profile',
    description: 'People can see your name, handle, avatar, and public bio.',
  },
  {
    icon: 'i-lucide-shield-check',
    label: 'Private account',
    description:
      'Your email, sign-in, preferences, and consent remain private.',
  },
  {
    icon: 'i-lucide-blocks',
    label: 'Apps you join',
    description: 'The same profile identifies you in each App.',
  },
]

const isLoading = computed(() => {
  if (!hasAuthState.value) return true
  if (!isAuthenticated.value) return false
  if (coreOutcome.value === 'idle' || coreOutcome.value === 'pending')
    return true
  if (accountOutcome.value === 'idle' || accountOutcome.value === 'pending')
    return true
  return (
    selfJoinEnabled &&
    (appOutcome.value === 'idle' || appOutcome.value === 'pending')
  )
})
const readError = computed(() => {
  const cause =
    coreError.value ||
    accountError.value ||
    (selfJoinEnabled ? appError.value : null)
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
    selfJoinEnabled &&
    appOutcome.value === 'missing'
)
const appLabel = computed(() => appName || 'this App')
const ecosystemLabel = computed(() =>
  ecosystem === 'misebox' ? 'Misebox' : ecosystem || 'FireUX'
)
const authEmail = computed(() => authUser.value?.email || 'Signed-in account')
const authAvatar = computed(() => authUser.value?.photoURL || '')
const displayName = computed(
  () =>
    authUser.value?.displayName?.trim() ||
    authEmail.value.split('@')[0] ||
    'New User'
)
const activeStep = computed(() =>
  isSignIn.value ? 0 : requiresUser.value ? 1 : steps.value.length - 1
)
const signInTarget = computed(() => '/auth')
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
    await router.replace(returnTarget.value)
  } catch (cause) {
    error.value =
      cause instanceof Error
        ? cause.message
        : 'Unable to complete setup. Please try again.'
  } finally {
    isEnsuring.value = false
  }
}
</script>
