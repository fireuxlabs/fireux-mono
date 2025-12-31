<template>
  <slot
    :should-render="shouldRender"
    :title="title"
    :description="description"
    :primary="primary"
    :error="error"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useFireUXConfig } from '../../../../composables/fireux/app/FireUXConfig'
import { useUser } from '../../../../composables/fireux/firestore/core/user/useUser'

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

const { appName, ecosystem } = useFireUXConfig()
const { cta, ensureCore, ensureApp } = useUser()

const error = ref<string | null>(null)
const isEnsuring = ref(false)

const ctaKey = computed(() => cta.value?.key ?? 'avatar')
const shouldRender = computed(() => ctaKey.value !== 'avatar')

const isSignIn = computed(() => ctaKey.value === 'sign-in')
const requiresCore = computed(() => ctaKey.value === 'create-core-user')
const requiresApp = computed(() => ctaKey.value === 'join-app')

const appLabel = computed(() => appName ?? 'this workspace')
const ecosystemLabel = computed(() => ecosystem ?? 'FireUX')

const title = computed(() => {
  if (isSignIn.value) return 'Sign in to continue'
  if (requiresCore.value) return 'Create your core user'
  if (requiresApp.value) return `Join ${appLabel.value}`
  return 'Update your profile'
})

const description = computed(() => {
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
    if (requiresCore.value) {
      await ensureCore()
    } else if (requiresApp.value) {
      await ensureApp()
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
