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
            <UserCardsPill
              v-if="currentUserPill"
              v-bind="currentUserPill"
              :link="Boolean(currentUserPill && currentUserPill.to)"
              :show-badges="false"
            />

            <div class="flex w-full flex-col gap-3">
              <UButton
                block
                color="primary"
                @click="goToCompletion"
              >
                {{ authActionLabel }}
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
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useRoute, useRouter, watch } from '#imports'
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'
import { useAuth } from '../../composables/fireux/firebase/useAuth'
import { useUser } from '../../user/composables/useUser'
import { useUserInterface } from '../../user/composables/useUserInterface'
import {
  resolveInternalRedirect,
  userOnboardingPath,
} from '../../utils/onboarding-route'

const router = useRouter()
const route = useRoute()
const {
  authState,
  hasAuthState,
  signOutUser,
  signInWithGoogle,
} = useAuth()
const isAuthenticated = computed(() => authState.value === 'AUTHENTICATED')
const signOutLoading = ref(false)
const providerLoading = ref(false)
const providerError = ref('')
const navigationInFlight = ref(false)
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
const authMode = computed(() =>
  route.query.mode === 'sign-up' ? 'sign-up' : 'sign-in'
)
const resolvedPostAuthPath = computed(() => {
  const redirect = resolveInternalRedirect(route.query.redirect)
  if (authMode.value === 'sign-up') return userOnboardingPath(redirect)
  if (route.query.redirect != null) return redirect
  if (route.path === '/auth') return '/dashboard'
  return route.fullPath || '/dashboard'
})

const authActionLabel = computed(() =>
  route.path === '/apps/create' ? 'Continue onboarding' : 'Open Dashboard'
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
    ] as const,
  async (
    [path, authReady, authenticated, target]: readonly [
      string,
      boolean,
      boolean,
      string,
    ]
  ) => {
    if (path !== '/auth') return
    if (!authReady || !authenticated) return
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

const handleGoogle = async () => {
  if (providerLoading.value) return
  providerError.value = ''
  providerLoading.value = true
  try {
    const user = await signInWithGoogle()
    if (user?.uid && authMode.value === 'sign-up') {
      await completeAuthNavigation(resolvedPostAuthPath.value)
    }
  } catch (error) {
    const message = error instanceof Error ? error.message.trim() : ''
    providerError.value = message || 'Sign-in could not be completed.'
  } finally {
    providerLoading.value = false
  }
}

</script>
