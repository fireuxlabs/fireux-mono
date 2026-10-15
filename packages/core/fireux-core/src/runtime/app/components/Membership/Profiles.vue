<template>
  <UPageCard
    v-if="profileEntries.length"
    title="Profile types"
    icon="i-lucide-badge-plus"
    variant="subtle"
  >
    <div class="grid gap-3 sm:grid-cols-2">
      <div
        v-for="entry in profileEntries"
        :key="entry.profileId"
        class="flex items-center justify-between gap-3 rounded-lg border border-default bg-default px-4 py-3"
      >
        <div class="min-w-0">
          <p class="truncate text-sm font-medium">{{ entry.label }}</p>
          <p class="text-xs text-dimmed">Available to add</p>
        </div>
        <UButton
          :to="entry.to"
          label="Add"
          color="neutral"
          variant="soft"
          size="xs"
        />
      </div>
    </div>
  </UPageCard>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useUserSession } from '../../../user/composables/session/useUserSession'
import { useDashboardNav } from '../../../composables/navigation/useDashboardNav'
const { appOutcome: appUserOutcome } = useUserSession()
const { availableProfileEntries } = useDashboardNav()
const profileEntries = computed(() =>
  appUserOutcome.value === 'ready' ? availableProfileEntries.value : []
)
</script>
