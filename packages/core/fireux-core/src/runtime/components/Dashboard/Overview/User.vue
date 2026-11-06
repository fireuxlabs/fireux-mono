<!-- Concurrent edit — 2026-07-21 15:25 CEST — Dashboard Overview product pass: turn the User layer into a real identity hero with exception-only prompts. -->
<template>
  <UPageCard variant="subtle">
    <div
      class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between"
    >
      <div class="flex min-w-0 items-center gap-4 sm:gap-5">
        <UAvatar
          :src="card.avatarUrl"
          :alt="card.displayName"
          size="3xl"
          class="shrink-0"
        />
        <div class="min-w-0">
          <p>Welcome back, {{ firstName }}</p>
          <h1 class="mt-1 truncate">
            {{ card.displayName }}
          </h1>
          <p v-if="card.handle" class="mt-1">
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
import type { UserCard } from '../../../user/composables/useUserView'
import type { DashboardOverviewOutcome } from './types'

const props = defineProps<{
  card: UserCard
  hasCustomAvatar: boolean
  accountOutcome: DashboardOverviewOutcome
}>()

const firstName = computed(
  () => props.card.displayName.trim().split(/\s+/u)[0] || 'there'
)

const completionPrompt = computed(() => {
  if (!props.card.handle) {
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
  if (props.accountOutcome === 'error') {
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
  if (props.accountOutcome === 'empty') {
    return {
      color: 'warning' as const,
      title: 'Repair account setup',
      description:
        'Your public profile exists, but your account settings need attention.',
      icon: 'i-lucide-user-round-cog',
      to: '/users/create',
      actionLabel: 'Repair account',
      actionIcon: 'i-lucide-wrench',
    }
  }
  return null
})
</script>
