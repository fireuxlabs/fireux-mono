<template>
  <UPageCard
    v-if="profileEntries.length"
    title="Profile types"
    icon="i-lucide-badge-plus"
    variant="subtle"
  >
    <UPageGrid>
      <UPageCard
        v-for="entry in profileEntries"
        :key="entry.profileId"
        :title="entry.label"
        description="Available to add"
        variant="naked"
      >
        <UButton
          :to="entry.to"
          label="Add"
          color="neutral"
          variant="soft"
          size="xs"
        />
      </UPageCard>
    </UPageGrid>
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
