<template>
  <ClientOnly>
    <div v-if="chef" class="space-y-6">
      <UCard>
        <div class="space-y-2">
          <h3 class="text-base font-semibold text-highlighted">
            App-level Chef Settings
          </h3>
          <p class="text-sm text-muted">
            There are currently no app-specific fields for the chef profile.
          </p>
          <p class="text-xs text-dimmed">
            This section is reserved for tenant-specific overrides when they are
            needed.
          </p>
        </div>
      </UCard>
    </div>

    <MoleculesStateCard
      v-else
      entity="chef app profile"
      kind="document"
      loading
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import type { Chef } from '../../../utils/chef.ts'

defineProps<{
  chef: Partial<Chef> | null | undefined
}>()
</script>
