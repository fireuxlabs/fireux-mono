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
            <UButton
              v-if="accountProvisionErrorMessage"
              block
              color="primary"
              variant="soft"
              :loading="creatingUser"
              @click="handleAccountRecovery"
            >
              Complete account setup
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

const router = useRouter()
const route = useRoute()
  const {
    authState,
    hasAuthState,
    signOutUser,
    signInWithGoogle,
    creating: creatingUser,
    lastAccountProvisionError,
  } = useAuth()
const isAuthenticated = computed(() => authState.value === 'AUTHENTICATED')
const signOutLoading = ref(false)
const providerLoading = ref(false)
const providerError = ref('')
const navigationInFlight = ref(false)
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
const resolvedPostAuthPath = computed(() => {
  const redirect = sanitizeRedirect(route.query.redirect)
  if (redirect) return redirect
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

const handleAccountRecovery = async () => {
  await router.push('/users/create').catch(() => {})
}

const handleGoogle = async () => {
  if (providerLoading.value) return
  providerError.value = ''
  providerLoading.value = true
  try {
    await signInWithGoogle()
  } catch (error) {
    const message = error instanceof Error ? error.message.trim() : ''
    if (message.includes('Accept the current Terms of Service')) {
      await router.push({
        path: '/users/create',
        query: { redirect: resolvedPostAuthPath.value },
      })
      return
    }
    providerError.value = message || 'Your signed-in account could not be prepared.'
  } finally {
    providerLoading.value = false
  }
}
</script>
