<!-- Concurrent edit — 2026-07-21 14:55 CEST — Dashboard Overview pass: add the universal User identity and account-health layer. -->
<template>
  <UPageCard variant="subtle">
    <h2 class="sr-only">Your User identity</h2>
    <div
      class="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="min-w-0 space-y-3">
        <UBadge color="primary" variant="subtle">User</UBadge>
        <UUser
          :name="card.displayName"
          :description="card.handle || 'Public identity'"
          :avatar="{ src: card.avatarUrl, alt: card.displayName }"
          size="xl"
        />
      </div>

      <div class="flex flex-wrap gap-2">
        <UButton
          to="/dashboard/user-profile"
          label="Edit public profile"
          icon="i-lucide-pencil"
        />
        <UButton
          v-if="card.to"
          :to="card.to"
          label="View profile"
          icon="i-lucide-external-link"
          color="neutral"
          variant="soft"
        />
      </div>
    </div>

    <USeparator class="my-5" />

    <div class="grid gap-3 md:grid-cols-3">
      <div class="rounded-lg border border-default p-4">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-xs font-medium uppercase tracking-wide text-dimmed">
              Public profile
            </p>
            <p class="mt-1 font-medium text-highlighted">
              {{ publicStatus.label }}
            </p>
          </div>
          <UBadge :color="publicStatus.color" variant="soft">
            {{ publicStatus.badge }}
          </UBadge>
        </div>
        <p class="mt-2 text-sm text-muted">{{ publicStatus.detail }}</p>
      </div>

      <div class="rounded-lg border border-default p-4">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-xs font-medium uppercase tracking-wide text-dimmed">
              Private account
            </p>
            <p class="mt-1 font-medium text-highlighted">
              {{ privateStatus.label }}
            </p>
          </div>
          <UBadge :color="privateStatus.color" variant="soft">
            {{ privateStatus.badge }}
          </UBadge>
        </div>
        <p class="mt-2 text-sm text-muted">{{ privateStatus.detail }}</p>
      </div>

      <div class="rounded-lg border border-default p-4">
        <p class="text-xs font-medium uppercase tracking-wide text-dimmed">
          Recommended next
        </p>
        <p class="mt-1 font-medium text-highlighted">{{ nextAction.label }}</p>
        <p class="mt-2 text-sm text-muted">{{ nextAction.detail }}</p>
        <UButton
          :to="nextAction.to"
          :label="nextAction.buttonLabel"
          :icon="nextAction.icon"
          color="neutral"
          variant="ghost"
          size="sm"
          class="mt-2 -ml-2"
        />
      </div>
    </div>
  </UPageCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { UserCard } from '../../../composables/fireux/firestore/core/user/utils/view/useUserInterface'
import type { DashboardOverviewOutcome } from './types'

type StatusColor = 'neutral' | 'success' | 'warning' | 'error'

const props = defineProps<{
  card: UserCard.Card
  hasCustomAvatar: boolean
  privateOutcome: DashboardOverviewOutcome
}>()

const publicStatus = computed<{
  label: string
  badge: string
  detail: string
  color: StatusColor
}>(() =>
  props.card.handle
    ? {
        label: 'Ready to share',
        badge: 'Ready',
        detail: 'Your name, handle, and avatar form your public identity.',
        color: 'success',
      }
    : {
        label: 'Choose a handle',
        badge: 'Action',
        detail:
          'A handle gives your public profile a stable, shareable address.',
        color: 'warning',
      }
)

const privateStatus = computed<{
  label: string
  badge: string
  detail: string
  color: StatusColor
}>(() => {
  if (props.privateOutcome === 'ready') {
    return {
      label: 'Account details ready',
      badge: 'Private',
      detail:
        'Sign-in details and preferences stay separate from public identity.',
      color: 'success',
    }
  }
  if (props.privateOutcome === 'error') {
    return {
      label: 'Check account settings',
      badge: 'Unavailable',
      detail:
        'Your public profile is safe, but private account details could not be read.',
      color: 'error',
    }
  }
  if (props.privateOutcome === 'missing') {
    return {
      label: 'Finish account setup',
      badge: 'Action',
      detail:
        'Your public identity exists, but your private settings need attention.',
      color: 'warning',
    }
  }
  return {
    label: 'Checking account',
    badge: 'Checking',
    detail:
      'Confirming your private account record without blocking this profile.',
    color: 'neutral',
  }
})

const nextAction = computed(() => {
  if (!props.card.handle) {
    return {
      label: 'Add your public handle',
      detail: 'Make your profile easy to find and share.',
      buttonLabel: 'Add handle',
      icon: 'i-lucide-at-sign',
      to: '/dashboard/user-profile',
    }
  }
  if (!props.hasCustomAvatar) {
    return {
      label: 'Make the profile yours',
      detail: 'Replace the default avatar with a photo or image you recognise.',
      buttonLabel: 'Add an image',
      icon: 'i-lucide-image-plus',
      to: '/dashboard/user-profile',
    }
  }
  if (props.privateOutcome === 'missing' || props.privateOutcome === 'error') {
    return {
      label: 'Review account settings',
      detail:
        'Resolve the private account warning while keeping public identity unchanged.',
      buttonLabel: 'Open settings',
      icon: 'i-lucide-settings',
      to: '/dashboard/settings',
    }
  }
  return {
    label: 'Your essentials are ready',
    detail:
      'Review your public profile whenever you want to refine how you appear.',
    buttonLabel: 'Review profile',
    icon: 'i-lucide-user-round-check',
    to: '/dashboard/user-profile',
  }
})
</script>
