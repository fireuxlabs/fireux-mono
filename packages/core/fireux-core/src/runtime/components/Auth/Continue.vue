<template>
  <div class="fx-card-body-stack" role="status">
    <template v-if="setupError || navigationError">
      <UAlert
        color="error"
        title="Your account could not be opened"
        :description="navigationError || 'Please try again.'"
      />
      <FireCopyError
        :message="`Your account could not be opened: ${navigationError || 'Please try again.'}`"
      />
      <UButton
        label="Try again"
        :disabled="navigationInFlight || accountSwitchBusy"
        @click="retry"
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
      <FireState outcome="pending" entity="account" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useRoute, useRouter, watch } from '#imports'
import { useAuth } from '../../composables/fireux/firebase/useAuth'
import { useUserSetup } from '../../user/composables/account/useUserSetup'
import {
  resolvePostAuthDestination,
  userOnboardingPath,
} from '../../user/utils/auth-redirect'
const route = useRoute()
const router = useRouter()
const { isAuthenticated, hasAuthState, signOutUser } = useAuth()
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
const navigationError = ref('')
const navigationInFlight = ref(false)

const { status: setupStatus, error: setupError } = useUserSetup()
const resolvedPostAuthPath = computed(() => {
  const destination = resolvePostAuthDestination(route.query.redirect)
  if (setupStatus.value.pending || setupStatus.value.failed) return ''
  if (setupStatus.value.needsSetup) return userOnboardingPath(destination)
  return destination
})

async function completeAuthNavigation(target: string) {
  if (
    !target ||
    navigationInFlight.value ||
    accountSwitchBusy.value ||
    route.path !== '/auth'
  )
    return
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

function retry() {
  if (setupError.value || setupStatus.value.failed) {
    window.location.reload()
    return
  }
  return completeAuthNavigation(resolvedPostAuthPath.value)
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
</script>
