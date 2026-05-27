<template>
  <UContainer>
    <div class="space-y-4 py-4">
      <div class="space-y-1">
        <h2 class="text-base font-semibold">{{ title }}</h2>
        <p class="text-sm text-gray-500">{{ description }}</p>
      </div>

      <div class="flex">
        <UButton
          v-if="primary.kind === 'link'"
          color="primary"
          size="lg"
          :to="primary.to"
        >
          {{ primary.label }}
        </UButton>

        <UButton
          v-else-if="primary.kind === 'action'"
          color="primary"
          size="lg"
          :loading="primary.loading"
          :disabled="primary.disabled"
          @click="primary.onClick"
        >
          {{ primary.label }}
        </UButton>

        <UButton v-else color="neutral" size="lg" disabled>
          {{ primary.label }}
        </UButton>
      </div>

      <p v-if="error" class="text-sm text-red-600">
        {{ error }}
      </p>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useFireUXConfig } from '../../../composables/fireux/app/FireUXConfig'
import { useApp } from '../../../composables/fireux/firestore/core/app/useApp'
import { useUser } from '../../../composables/fireux/firestore/core/user/useUser'

type PrimaryAction =
  | {
      kind: 'link'
      label: string
      to: string
      loading: boolean
      disabled: boolean
    }
  | {
      kind: 'action'
      label: string
      onClick: () => Promise<void>
      loading: boolean
      disabled: boolean
    }
  | {
      kind: 'none'
      label: string
      loading: boolean
      disabled: boolean
    }

const { appId, appName, ecosystem } = useFireUXConfig()
const { cta, createUser, core, isLoading, user } = useUser()
const { membership: appMembership } = useApp()

const error = ref<string | null>(null)
const isEnsuring = ref(false)

const uid = computed(() => user.value?.id ?? null)

const ctaKey = computed(() => cta.value?.key ?? 'avatar')
const shouldRender = computed(() => ctaKey.value !== 'avatar')

const isSignIn = computed(() => ctaKey.value === 'sign-in')
const requiresCore = computed(() => ctaKey.value === 'create-core-user')
const requiresApp = computed(() => ctaKey.value === 'join-app')

const appLabel = computed(() => appName ?? 'this workspace')
const ecosystemLabel = computed(() => ecosystem ?? 'FireUX')

const title = computed(() => {
  if (isLoading.value) return 'Loading user'
  if (isSignIn.value) return 'Sign in to continue'
  if (requiresCore.value) return 'Create your core user'
  if (requiresApp.value) return `Join ${appLabel.value}`
  return 'Update your profile'
})

const description = computed(() => {
  if (isLoading.value) return 'Resolving your user record and memberships.'
  if (isSignIn.value)
    return 'Authenticate to load your user details and continue setup.'
  if (requiresCore.value)
    return `Provision your ${ecosystemLabel.value} profile so apps can recognize you.`
  if (requiresApp.value)
    return `Mirror your profile inside ${appLabel.value} to unlock tenant features.`
  return 'Update your profile to keep your information in sync.'
})

const buttonLabel = computed(() => cta.value?.label ?? 'Continue')
const linkTarget = computed(() => (isSignIn.value ? cta.value?.to ?? '/auth' : ''))

const canTriggerAction = computed(() => requiresCore.value || requiresApp.value)

const handleEnsure = async () => {
  if (!canTriggerAction.value || isEnsuring.value) return

  error.value = null
  isEnsuring.value = true

  try {
    if (requiresCore.value || requiresApp.value) {
      await createUser()
    }

    if (appId && uid.value && core?.membership && appMembership?.setAdmin) {
      await core.membership.joinApp(appId, 'user')
      await appMembership.setAdmin(uid.value, false)
    }
  } catch (e) {
    const message =
      e instanceof Error
        ? e.message
        : 'Unable to update your profile. Please try again.'
    error.value = message
  } finally {
    isEnsuring.value = false
  }
}

const primary = computed<PrimaryAction>(() => {
  if (isLoading.value) {
    return {
      kind: 'none',
      label: 'Loading…',
      loading: false,
      disabled: true,
    }
  }

  if (!shouldRender.value) {
    return {
      kind: 'none',
      label: buttonLabel.value,
      loading: false,
      disabled: true,
    }
  }

  if (linkTarget.value) {
    return {
      kind: 'link',
      label: buttonLabel.value,
      to: linkTarget.value,
      loading: false,
      disabled: false,
    }
  }

  if (canTriggerAction.value) {
    return {
      kind: 'action',
      label: buttonLabel.value,
      onClick: handleEnsure,
      loading: isEnsuring.value,
      disabled: isEnsuring.value,
    }
  }

  return {
    kind: 'none',
    label: buttonLabel.value,
    loading: false,
    disabled: true,
  }
})
</script>
