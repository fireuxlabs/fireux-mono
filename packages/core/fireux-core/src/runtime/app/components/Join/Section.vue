<template>
  <UPageCard title="Join this app" :description="description" variant="subtle">
    <MoleculesStateCard
      v-if="pending && !error"
      entity="App access"
      kind="document"
      surface="bare"
      loading
    />
    <MoleculesStateCard
      v-else-if="error"
      entity="App access"
      kind="document"
      surface="bare"
      state="error"
    />
    <div v-else class="flex flex-wrap items-center gap-2">
      <UButton
        v-if="!isAuthenticated"
        :to="authTo"
        icon="i-lucide-log-in"
        color="primary"
      >
        Sign in to join
      </UButton>

      <UButton
        v-else-if="canRequest"
        icon="i-lucide-user-plus"
        color="primary"
        :loading="submitting"
        :disabled="submitting"
        @click="submit"
      >
        Request to join
      </UButton>

      <UBadge v-else-if="hasPendingRequest" color="warning" variant="soft">
        Request pending
      </UBadge>

      <UBadge v-else-if="isAppMember" color="primary" variant="soft">
        Joined
      </UBadge>
    </div>
  </UPageCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useToastify } from '../../../composables/ui/useToastify'
import { useFireUXConfig } from '../../composables/config/FireUXConfig'
import { useAppJoinRequest } from '../../composables/membership/useAppJoinRequest'

const { appName } = useFireUXConfig()
const {
  pending,
  error,
  captureIntent,
  isAuthenticated,
  isAppMember,
  hasPendingRequest,
  canRequest,
  requestJoinApp,
} = useAppJoinRequest()
const toast = useToastify()
const submitting = ref(false)

const appLabel = computed(() => String(appName || 'this app').trim())
const description = computed(() => {
  if (pending.value || error.value) return ''
  if (!isAuthenticated.value) {
    return `Sign in to request access to ${appLabel.value}.`
  }

  if (isAppMember.value) {
    return `You are already a member of ${appLabel.value}.`
  }

  if (hasPendingRequest.value) {
    return `Your request to join ${appLabel.value} is waiting for an app admin.`
  }

  return `Ask an app admin to add you to ${appLabel.value}. This does not grant workspace access.`
})
const authTo = computed(() => '/auth')

async function submit() {
  if (!canRequest.value || submitting.value) return

  const isCurrent = captureIntent()
  submitting.value = true
  try {
    await requestJoinApp()
    if (isCurrent()) toast.success('Join request sent')
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Could not send join request'
    if (isCurrent()) toast.error(message)
  } finally {
    submitting.value = false
  }
}
</script>
