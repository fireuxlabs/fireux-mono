<template>
  <!-- Hero + quick actions -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
    <UPageCard
      class="lg:col-span-2"
      variant="subtle"
      :ui="{ container: 'flex flex-col sm:flex-row sm:items-center gap-4' }"
    >
      <div class="flex-1 min-w-0">
        <OrganismsUserCardsPill v-if="currentUserPill" :user="currentUserPill" />
        <USkeleton v-else class="h-11 w-full" />
      </div>
      <div class="sm:ms-auto flex flex-wrap gap-2">
        <UButton
          to="/dashboard/user-profile"
          label="Edit profile"
          color="neutral"
          size="sm"
        />
        <UButton
          to="/dashboard/settings"
          label="Preferences"
          variant="ghost"
          size="sm"
        />
      </div>
    </UPageCard>
  </div>

  <!-- Next steps (core-only) -->
  <div class="grid grid-cols-1 gap-4">
    <UPageCard
      v-if="!pending && profileCompleteValue != null && profileCompleteValue < 100"
      title="Complete your profile"
      variant="subtle"
    >
      <div class="space-y-3">
        <div class="flex items-center justify-between gap-3">
          <span class="text-sm text-dimmed">Profile completion</span>
          <UBadge color="neutral" variant="soft">
            {{ profileCompleteValue }}%
          </UBadge>
        </div>
        <UProgress
          :model-value="profileCompleteValue ?? 0"
          :max="100"
          :ui="{ indicator: 'transition-none duration-0' }"
        />
      </div>

      <UButton
        to="/dashboard/user-profile"
        label="Edit profile"
        color="neutral"
        class="w-fit"
      />
    </UPageCard>
  </div>
</template>

<script setup lang="ts">
import { useUser } from '../../composables/fireux/firestore/core/user/useUser'
import { computed } from 'vue'

const { user, profileComplete, pending, pillProps } = useUser()

const currentUserPill = computed(() => (user.value ? pillProps(user.value) : null))

const profileCompleteValue = computed<number | null>(() => {
  if (profileComplete.value == null) return null
  const v = Number(profileComplete.value)
  if (!Number.isFinite(v)) return null
  return Math.max(0, Math.min(100, Math.round(v)))
})
</script>
