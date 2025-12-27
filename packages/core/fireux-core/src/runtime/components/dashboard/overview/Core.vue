<template>
  <UPageCard variant="subtle">
    <div class="space-y-4">
      <div class="space-y-1">
        <p class="text-sm font-medium">Welcome back</p>
      </div>

      <div class="space-y-2">
        <OrganismsUserCardsPill v-if="pill" :user="pill" />
        <USkeleton v-else class="h-11 w-full" />
      </div>

      <div class="space-y-2">
        <div v-if="showProfileCompletedness" class="space-y-2">
          <div class="flex items-center justify-between gap-3">
            <span class="text-sm text-dimmed">Profile completedness</span>
            <UBadge color="neutral" variant="soft">
              {{ profileLabel }}
            </UBadge>
          </div>

          <UProgress
            :model-value="profileComplete ?? 0"
            :max="100"
            :ui="{ indicator: 'transition-none duration-0' }"
          />
        </div>

        <div class="flex">
          <UButton
            to="/dashboard/user-profile"
            label="Edit profile"
            color="neutral"
            size="sm"
          />
        </div>
      </div>
    </div>
  </UPageCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUser } from '../../../composables/fireux/firestore/core/user/useUser'

const { currentUser, profileComplete, pillProps, isLoading } = useUser()

const pill = computed(() => {
  if (isLoading.value) return null
  const user = currentUser.value
  if (!user) return null
  return pillProps(user)
})

const showProfileCompletedness = computed(() => {
  return profileComplete.value == null || profileComplete.value < 100
})

const profileLabel = computed(() => {
  if (profileComplete.value == null) return '—'
  return `${profileComplete.value}%`
})
</script>
