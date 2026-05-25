<template>
  <ClientOnly>
    <div v-if="kitchen" class="space-y-6">
      <UCard>
        <div class="space-y-2">
          <h3 class="text-base font-semibold text-gray-900">
            App-level Kitchen Settings
          </h3>
          <p class="text-sm text-gray-500">
            There are currently no app-specific fields for kitchen identity.
          </p>
          <p class="text-xs text-gray-400">
            This section is reserved for tenant-specific public menu and display settings when they are needed.
          </p>
        </div>
      </UCard>
    </div>

    <MoleculesStateCard
      v-else
      entity="kitchen app identity"
      kind="document"
      loading
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import type { Kitchen } from '../../../../models/kitchen.model'

defineProps<{
  kitchen: Partial<Kitchen> | null | undefined
}>()
</script>
