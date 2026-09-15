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

        <div
          v-if="isAuthenticated"
          class="flex min-h-48 flex-col items-center justify-center gap-4"
          role="status"
        >
          <template v-if="coreError || providerError">
            <UAlert
              color="error"
              title="Your account could not be opened"
              :description="providerError || 'Please try again.'"
            />
            <UButton
              label="Try again"
              @click="completeAuthNavigation(resolvedPostAuthPath)"
            />
          </template>
          <template v-else>
            <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin" />
            <span>Opening your account…</span>
          </template>
        </div>

        <template v-else>
          <UAlert
            v-if="authUnavailableMessage"
            color="error"
            variant="subtle"
            title="Sign-in is not available"
            :description="authUnavailableMessage"
          />

          <template v-else>
            <UButton
              block
              color="neutral"
              variant="subtle"
              :loading="providerLoading"
              :disabled="providerLoading"
              icon="i-logos-google-icon"
              @click="handleGoogle"
            >
              Continue with Google
            </UButton>

            <UAlert
              v-if="providerError"
              color="error"
              variant="subtle"
              title="Unable to sign in"
              :description="providerError"
            />

            <USeparator label="or continue with email" />

            <AuthEmailPanel
              :brand-label="ecosystemLabel"
              :default-mode="authMode"
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
import { useUserSession } from '../../user/composables/useUserSession'
import {
  resolvePostAuthDestination,
  userOnboardingPath,
} from '../../utils/onboarding-route'

const router = useRouter()
const route = useRoute()
const { authState, hasAuthState, lastBindError, signInWithGoogle } = useAuth()
const isAuthenticated = computed(() => authState.value === 'AUTHENTICATED')
const providerLoading = ref(false)
const providerError = ref('')
const navigationInFlight = ref(false)
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
    return 'Firebase Authentication has not been initialized for this App.'
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
  providerError.value = ''
  try {
    await router.replace(target)
  } catch {
    providerError.value = 'Please try opening your account again.'
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
  if (providerLoading.value) return
  providerError.value = ''
  providerLoading.value = true
  try {
    await signInWithGoogle()
  } catch (error) {
    const message = error instanceof Error ? error.message.trim() : ''
    providerError.value = message || 'Sign-in could not be completed.'
  } finally {
    providerLoading.value = false
  }
}
</script>
