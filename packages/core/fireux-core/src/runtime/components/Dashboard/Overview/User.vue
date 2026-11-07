<template>
  <FireState v-if="coreIsLoading" outcome="pending" entity="your profile" />
  <FireDashboardOverviewRecovery
    v-else-if="coreIsError || !card"
    :outcome="coreIsError ? 'error' : 'empty'"
    :error="coreError"
  />
  <UPageCard v-else-if="card" variant="subtle">
    <div>
      <div>
        <UAvatar :src="card.avatarUrl" :alt="card.displayName" size="3xl" />
        <div>
          <p>Welcome back, {{ firstName }}</p>
          <h1>
            {{ card.displayName }}
          </h1>
          <p v-if="card.handle">
            {{ card.handle }}
          </p>
        </div>
      </div>

      <div class="fx-card__actions">
        <UButton
          v-if="card.to"
          :to="card.to"
          label="View profile"
          icon="i-lucide-external-link"
        />
        <UButton
          to="/dashboard/user-profile"
          label="Edit profile"
          icon="i-lucide-pencil"
          color="neutral"
          variant="soft"
        />
        <UButton
          to="/dashboard/settings"
          label="Settings"
          icon="i-lucide-settings"
          color="neutral"
          variant="ghost"
        />
      </div>
    </div>

    <UAlert
      v-if="completionPrompt"
      :color="completionPrompt.color"
      variant="subtle"
      :icon="completionPrompt.icon"
      :title="completionPrompt.title"
      :description="completionPrompt.description"
      orientation="horizontal"
    >
      <template #actions>
        <UButton
          :to="completionPrompt.to"
          :label="completionPrompt.actionLabel"
          :icon="completionPrompt.actionIcon"
          color="neutral"
          variant="soft"
          size="sm"
        />
      </template>
    </UAlert>
  </UPageCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import { useUserRead } from '../../../user/composables/useUserRead'
import { useUserAccount } from '../../../user/composables/account/useUserAccount'
import { useUserView } from '../../../user/composables/useUserView'

const { uid } = useAuth()
const {
  user: coreUser,
  outcome: coreOutcome,
  error: coreError,
} = useUserRead(uid)
const { outcome: accountOutcome } = useUserAccount()
const { profile } = useUserView()
const card = computed(() => profile(coreUser.value ?? null))
const coreIsLoading = computed(
  () => coreOutcome.value === 'idle' || coreOutcome.value === 'pending'
)
const coreIsError = computed(
  () => coreOutcome.value === 'error' || Boolean(coreError.value)
)
const firstName = computed(
  () => card.value?.displayName.trim().split(/\s+/u)[0] || 'there'
)

const completionPrompt = computed(() => {
  if (!card.value) return null
  if (!card.value.handle) {
    return {
      color: 'warning' as const,
      title: 'Choose a public handle',
      description:
        'Give your profile a stable address people can find and share.',
      icon: 'i-lucide-at-sign',
      to: '/dashboard/user-profile',
      actionLabel: 'Add handle',
      actionIcon: 'i-lucide-arrow-right',
    }
  }
  if (accountOutcome.value === 'error') {
    return {
      color: 'error' as const,
      title: 'Account settings unavailable',
      description:
        'Your public profile is safe, but account settings could not be read.',
      icon: 'i-lucide-shield-alert',
      to: '/dashboard/settings',
      actionLabel: 'Open settings',
      actionIcon: 'i-lucide-settings',
    }
  }
  if (accountOutcome.value === 'empty') {
    return {
      color: 'warning' as const,
      title: 'Finish account setup',
      description:
        'Your public profile exists. Finish setting up your private account.',
      icon: 'i-lucide-user-round-cog',
      to: '/users/create',
      actionLabel: 'Continue',
      actionIcon: 'i-lucide-wrench',
    }
  }
  return null
})
</script>
