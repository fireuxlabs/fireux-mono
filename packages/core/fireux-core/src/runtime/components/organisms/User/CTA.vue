<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/User/CTA.vue -->
<template>
  <div v-if="shouldRender" class="space-y-3">
    <UPageCTA :title="title" :description="description" variant="naked">
      <template #links>
        <UButton
          color="primary"
          size="lg"
          :to="linkTarget || undefined"
          :loading="isEnsuring"
          :disabled="isEnsuring || (!linkTarget && !canTriggerAction)"
          @click="handleAction"
        >
          {{ buttonLabel }}
        </UButton>
      </template>
    </UPageCTA>

    <p v-if="actionError" class="cta-error">{{ actionError }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useUser } from 'fireux-core/runtime/composables/firestore/core/user/useUser.ts'

const { appName, ecosystem } = useFireUXConfig()
const { cta, ensureCore, ensureApp } = useUser()

const actionError = ref<string | null>(null)
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
const linkTarget = computed(() =>
  isSignIn.value ? cta.value?.to ?? '/auth' : null
)
const canTriggerAction = computed(() => requiresCore.value || requiresApp.value)

const handleAction = async () => {
  if (linkTarget.value) return
  if (!canTriggerAction.value || isEnsuring.value) return

  actionError.value = null
  isEnsuring.value = true

  try {
    if (requiresCore.value) {
      await ensureCore()
    } else if (requiresApp.value) {
      await ensureApp()
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to update your profile. Please try again.'
    actionError.value = message
  } finally {
    isEnsuring.value = false
  }
}
</script>

<style scoped>
.cta-error {
  margin: 0;
  font-size: 0.875rem;
  color: #dc2626;
}
</style>
