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
          <p class="text-sm font-medium text-primary">
            Welcome back, {{ firstName }}
          </p>
          <h1
            class="mt-1 truncate text-2xl font-semibold tracking-tight text-highlighted sm:text-3xl"
          >
            {{ card.displayName }}
          </h1>
          <p v-if="card.handle" class="mt-1 text-sm text-muted">
            {{ card.handle }}
          </p>
        </div>
      </div>

      <div class="flex flex-wrap gap-2">
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
      class="mt-6"
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
import type { UserCard } from '../../../user/composables/useUserInterface'
import type { DashboardOverviewOutcome } from './types'

const props = defineProps<{
  card: UserCard.Card
  hasCustomAvatar: boolean
  privateOutcome: DashboardOverviewOutcome
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
  if (!props.hasCustomAvatar) {
    return {
      color: 'warning' as const,
      title: 'Add a profile photo',
      description:
        'Replace the default avatar with a photo or image you recognise.',
      icon: 'i-lucide-image-plus',
      to: '/dashboard/user-profile',
      actionLabel: 'Add photo',
      actionIcon: 'i-lucide-arrow-right',
    }
  }
  if (props.privateOutcome === 'error') {
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
  if (props.privateOutcome === 'missing') {
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
