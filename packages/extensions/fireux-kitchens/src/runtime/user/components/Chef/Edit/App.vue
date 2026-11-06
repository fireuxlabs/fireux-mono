<template>
  <ClientOnly>
    <div v-if="chef" class="space-y-6">
      <UCard>
        <div class="fx-card-body-stack">
          <h3>App-level Chef Settings</h3>
          <p>
            There are currently no app-specific fields for the chef profile.
          </p>
          <p>
            This section is reserved for tenant-specific overrides when they are
            needed.
          </p>
        </div>
      </UCard>
    </div>

    <FireStateCard v-else entity="chef app profile" kind="document" loading />
  </ClientOnly>
</template>

<script setup lang="ts">
import type { Chef } from '../../../utils/chef.ts'

defineProps<{
  chef: Partial<Chef> | null | undefined
}>()
</script>
