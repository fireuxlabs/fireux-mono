<template>
  <UPageCard variant="subtle">
    <div class="space-y-4">
      <div class="space-y-1">
        <p class="text-sm font-medium">Welcome back</p>
      </div>

      <div class="space-y-2">
        <div class="w-fit max-w-full">
          <UserCardsPill
            v-if="pill"
            v-bind="pill"
            :link="Boolean(pill.to)"
            class="block"
          />
          <USkeleton v-else class="h-11 w-64 max-w-full" />
        </div>
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

const { currentUser, card, isLoading } = useUser()

const profileComplete = computed<number | null>(() => {
  if (isLoading.value) return null

  const current = currentUser.value
  if (!current) return 0

  const checks = [
    Boolean((current.display_name ?? '').trim()),
    Boolean((current.handle ?? '').trim()),
    Boolean((current.bio ?? '').trim()),
    Boolean((current.avatar ?? '').trim()),
  ]

  const total = checks.length
  const done = checks.filter(Boolean).length
  return Math.round((done / total) * 100)
})

const pill = computed(() => {
  if (isLoading.value) return null
  const user = currentUser.value
  if (!user) return null
  return card(user)
})

const showProfileCompletedness = computed(() => {
  return profileComplete.value == null || profileComplete.value < 100
})

const profileLabel = computed(() => {
  if (profileComplete.value == null) return '—'
  return `${profileComplete.value}%`
})

</script>
