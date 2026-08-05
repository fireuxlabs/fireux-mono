<!-- FILE: packages/core/fireux-core/src/runtime/components/Auth/System.vue -->
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
              v-if="accountProvisionErrorMessage"
              color="error"
              variant="subtle"
              title="Account setup incomplete"
              :description="accountProvisionErrorMessage"
            />
            <div
              v-if="accountRecoveryConsentRequired"
              class="flex items-start gap-2"
            >
              <UCheckbox
                v-model="accountRecoveryConsentAcknowledged"
                :aria-label="`Accept Terms of Service version ${FIREUX_ACCOUNT_TERMS_VERSION} and acknowledge Privacy Policy for account recovery`"
                :disabled="creatingUser"
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
              v-if="accountProvisionErrorMessage"
              block
              color="primary"
              variant="soft"
              :loading="creatingUser"
              :disabled="
                accountRecoveryConsentRequired &&
                !accountRecoveryConsentAcknowledged
              "
              @click="handleAccountRetry"
            >
              {{
                accountRecoveryConsentRequired
                  ? 'Complete account setup'
                  : 'Retry account setup'
              }}
            </UButton>
            <UserCardsPill
              v-else-if="currentUserPill"
              v-bind="currentUserPill"
              :link="Boolean(currentUserPill && currentUserPill.to)"
              :show-badges="false"
            />

            <div class="flex w-full flex-col gap-3">
              <UButton
                block
                color="primary"
                :disabled="
                  creatingUser || Boolean(accountProvisionErrorMessage)
                "
                @click="goToCompletion"
              >
                Open Dashboard
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
            :default-mode="authMode"
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
import { FIREUX_ACCOUNT_TERMS_VERSION } from '../../models/operations/user-account-provisioning'

const router = useRouter()
const route = useRoute()
const {
  authState,
  hasAuthState,
  signOutUser,
  signInWithGoogle,
  creating: creatingUser,
  lastAccountProvisionError,
  retryAccountProvisioning,
} = useAuth()
const isAuthenticated = computed(() => authState.value === 'AUTHENTICATED')
const signOutLoading = ref(false)
const providerLoading = ref(false)
const providerError = ref('')
const navigationInFlight = ref(false)
const googleConsentAcknowledged = ref(false)
const accountRecoveryConsentAcknowledged = ref(false)
const ACCOUNT_RECOVERY_CONSENT_MESSAGES = [
  'Accept the current Terms of Service and acknowledge the Privacy Policy to recover this incomplete account.',
  'Accept the current Terms of Service and acknowledge the Privacy Policy for a new account.',
] as const
const accountProvisionErrorMessage = computed(() => {
  const error = lastAccountProvisionError.value
  if (!error) return ''

  const message = error instanceof Error ? error.message.trim() : String(error)
  if (message.includes('canonical backfill')) {
    return 'We’re getting your account ready. Your login details are safe — please try again shortly.'
  }

  return message || 'Your signed-in account could not be prepared.'
})
const accountRecoveryConsentRequired = computed(() =>
  ACCOUNT_RECOVERY_CONSENT_MESSAGES.some((message) =>
    accountProvisionErrorMessage.value.includes(message)
  )
)

const config = useFireUXConfig()
const ecosystemLabel = config.ecosystem
const isTenantApp = computed(() => config.isTenant)
const ecosystemBrandLabel = computed(() =>
  ecosystemLabel === 'misebox' ? 'Misebox' : ecosystemLabel
)
const ecosystemBrandAlt = computed(
  () => `${ecosystemBrandLabel.value} ecosystem`
)
const ecosystemWordmarkLight = '/img/ecosystem/wordmark-light.svg'
const ecosystemWordmarkDark = '/img/ecosystem/wordmark-dark.svg'

const { currentUser } = useUser()
const { pill: userInterface } = useUserInterface()
const currentUserPill = computed(() =>
  currentUser.value ? userInterface(currentUser.value) : null
)
function sanitizeRedirect(value: unknown): string | null {
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== 'string') return null
  const trimmed = raw.trim()
  if (!trimmed.startsWith('/')) return null
  if (trimmed.startsWith('//')) return null
  return trimmed
}

const authMode = computed(() =>
  route.query.mode === 'sign-up' ? 'sign-up' : 'sign-in'
)
const resolvedPostAuthPath = computed(
  () => sanitizeRedirect(route.query.redirect) ?? '/dashboard'
)

async function completeAuthNavigation(target: string) {
  if (navigationInFlight.value) return
  navigationInFlight.value = true
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
    ] as const,
  async ([
    path,
    authReady,
    authenticated,
    target,
    creating,
    accountError,
  ]: readonly [string, boolean, boolean, string, boolean, unknown]) => {
    if (path !== '/auth') return
    if (!authReady || !authenticated) return
    if (creating) return
    if (accountError) return
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
  if (
    accountRecoveryConsentRequired.value &&
    !accountRecoveryConsentAcknowledged.value
  ) return
  await retryAccountProvisioning(
    accountRecoveryConsentRequired.value
      ? FIREUX_ACCOUNT_TERMS_VERSION
      : undefined
  ).catch(() => {})
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
