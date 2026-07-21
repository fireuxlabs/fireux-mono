<!-- Concurrent edit — 2026-07-21 14:57 CEST — Dashboard Overview pass: add the optional ecosystem identity-and-profile layer. -->
<template>
  <UPageCard
    class="h-full"
    title="Across your ecosystem"
    description="Your public identity can travel between connected apps, while each app keeps its own access and capabilities."
    icon="i-lucide-orbit"
    variant="subtle"
  >
    <div class="flex flex-wrap gap-2">
      <UBadge color="primary" variant="subtle">Ecosystem</UBadge>
      <UBadge color="success" variant="soft">Shared identity</UBadge>
      <UBadge color="neutral" variant="soft">
        {{ profileCountLabel }}
      </UBadge>
    </div>

    <USeparator class="my-5" />

    <div>
      <h3 class="font-medium text-highlighted">Shared profiles</h3>
      <p class="mt-1 text-sm text-muted">
        These specialist profiles extend your main User identity across this
        ecosystem.
      </p>

      <div v-if="profileEntries.length" class="mt-4 space-y-2">
        <div
          v-for="entry in profileEntries"
          :key="entry.profileId"
          class="flex items-center justify-between gap-3 rounded-lg border border-default px-3 py-2.5"
        >
          <div class="flex min-w-0 items-center gap-3">
            <UIcon
              :name="entry.icon || 'i-lucide-user-round'"
              class="size-5 shrink-0 text-dimmed"
            />
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-highlighted">
                {{ entry.label }}
              </p>
              <p class="text-xs text-muted">Active shared profile</p>
            </div>
          </div>
          <UButton
            :to="entry.to"
            label="Open"
            :aria-label="`Open ${entry.label} profile`"
            color="neutral"
            variant="ghost"
            size="sm"
          />
        </div>
      </div>

      <div
        v-else
        class="mt-4 rounded-lg border border-dashed border-default px-4 py-5"
      >
        <p class="text-sm font-medium text-highlighted">
          Your User is connected
        </p>
        <p class="mt-1 text-sm text-muted">
          You do not need a specialist profile for your main identity to work
          here.
        </p>
      </div>
    </div>
  </UPageCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DashboardOverviewProfileEntry } from './types'

const props = defineProps<{
  profileEntries: DashboardOverviewProfileEntry[]
}>()

const profileCountLabel = computed(() => {
  const count = props.profileEntries.length
  return `${count} shared profile${count === 1 ? '' : 's'}`
})
</script>
