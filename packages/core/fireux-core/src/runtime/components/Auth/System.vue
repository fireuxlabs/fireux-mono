<!-- FILE: packages/core/fireux-core/src/runtime/components/Auth/System.vue -->
<template>
  <div class="w-full">
    <UCard class="w-full">
      <div class="space-y-6">
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

        <div
          v-if="isAuthenticated"
          class="flex min-h-48 flex-col items-center justify-center gap-4"
          role="status"
        >
          <template v-if="coreError || navigationError">
            <UAlert
              color="error"
              title="Your account could not be opened"
              :description="navigationError || 'Please try again.'"
            />
            <MoleculesCopyError
              :message="`Your account could not be opened: ${navigationError || 'Please try again.'}`"
            />
            <UButton
              label="Try again"
              @click="completeAuthNavigation(resolvedPostAuthPath)"
            />
            <UButton
              label="Use another account"
              color="neutral"
              variant="ghost"
              :loading="accountSwitchBusy"
              @click="changeAccount"
            />
          </template>
          <template v-else>
            <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin" />
            <span>Opening your account…</span>
          </template>
        </div>

        <template v-else>
          <div class="space-y-1 text-center">
            <h1 class="text-2xl font-semibold tracking-tight">Your account</h1>
            <p class="text-sm text-muted">
              Sign in or create an account to continue.
            </p>
          </div>
          <UAlert
            v-if="authUnavailableMessage"
            color="error"
            variant="subtle"
            title="Sign-in is not available"
            :description="authUnavailableMessage"
          />
          <MoleculesCopyError
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
              :disabled="
                providerLoading || emailLoading || additionalProviderLoading
              "
              icon="i-logos-google-icon"
              @click="handleGoogle"
            >
              {{
                providerLoading ? 'Waiting for Google…' : 'Continue with Google'
              }}
            </UButton>

            <p
              v-if="providerLoading"
              role="status"
              class="text-center text-sm text-muted"
            >
              Complete sign-in in the Google window.
            </p>
            <div v-if="providerError" role="alert" class="space-y-2">
              <UAlert
                :color="providerError.color"
                variant="subtle"
                :title="providerError.title"
                :description="providerError.description"
              />
              <MoleculesCopyError
                :message="`${providerError.title}: ${providerError.description}`"
              />
            </div>

            <slot
              name="providers"
              :disabled="providerLoading || emailLoading"
              :set-busy="handleAdditionalProviderBusy"
            />

            <USeparator label="or continue with email" />

            <AuthEmailPanel
              :default-mode="authMode"
              :disabled="providerLoading || additionalProviderLoading"
              @busy="handleEmailBusy"
            />
          </template>
        </template>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useRoute, useRouter, watch } from '#imports'
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'
import { useAuth } from '../../composables/fireux/firebase/useAuth'
import { useUserSession } from '../../user/composables/session/useUserSession'
import { googleSignInFeedback, type SignInFeedback } from './sign-in-feedback'
import {
  resolvePostAuthDestination,
  userOnboardingPath,
} from '../../utils/onboarding-route'

const router = useRouter()
const route = useRoute()
const {
  authState,
  hasAuthState,
  lastBindError,
  signInWithGoogle,
  signOutUser,
} = useAuth()
const isAuthenticated = computed(() => authState.value === 'AUTHENTICATED')
const providerLoading = ref(false)
const emailLoading = ref(false)
const additionalProviderLoading = ref(false)
const accountSwitchBusy = ref(false)
async function changeAccount() {
  if (accountSwitchBusy.value) return
  accountSwitchBusy.value = true
  try {
    await signOutUser(route.fullPath)
  } finally {
    accountSwitchBusy.value = false
  }
}
function handleAdditionalProviderBusy(busy: boolean) {
  additionalProviderLoading.value = busy
}
const providerError = ref<SignInFeedback | null>(null)
const navigationError = ref('')
const navigationInFlight = ref(false)

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

const { coreOutcome, coreError } = useUserSession()
const authMode = computed(() =>
  route.query.mode === 'sign-up' ? 'sign-up' : 'sign-in'
)
const resolvedPostAuthPath = computed(() => {
  const destination = resolvePostAuthDestination(route.query.redirect)
  if (coreOutcome.value === 'missing') return userOnboardingPath(destination)
  if (coreOutcome.value === 'ready') return destination
  return ''
})

async function completeAuthNavigation(target: string) {
  if (!target || navigationInFlight.value) return
  navigationInFlight.value = true
  navigationError.value = ''
  try {
    await router.replace(target)
  } catch {
    navigationError.value = 'Please try opening your account again.'
  } finally {
    navigationInFlight.value = false
  }
}

watch(
  () =>
    [
      route.path,
      hasAuthState.value,
      isAuthenticated.value,
      resolvedPostAuthPath.value,
    ] as const,
  async ([path, authReady, authenticated, target]: readonly [
    string,
    boolean,
    boolean,
    string,
  ]) => {
    if (path !== '/auth') return
    if (!authReady || !authenticated) return
    await completeAuthNavigation(target)
  },
  { immediate: true }
)

const handleGoogle = async () => {
  if (
    providerLoading.value ||
    emailLoading.value ||
    additionalProviderLoading.value
  )
    return
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
