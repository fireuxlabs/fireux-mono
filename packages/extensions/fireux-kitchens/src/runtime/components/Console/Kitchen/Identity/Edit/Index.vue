<template>
  <section class="console-surface">
    <UPageCard
      v-if="!selectedKitchen"
      title="No kitchen selected"
      description="Select a kitchen before editing its identity."
      variant="subtle"
    />

    <UPageCard
      v-else-if="!canWrite"
      title="Kitchen identity is read-only"
      description="This kitchen cannot be edited in the current console mode."
      variant="subtle"
    />

    <div v-else class="space-y-6">
      <ConsoleKitchenIdentityEditRoot />
      <ConsoleKitchenIdentityEditScoped v-if="false" :kitchen="selectedKitchen" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleIdentity } from '../../../../../composables/fireux/console/kitchen/useKitchenConsoleIdentity'

const { selectedKitchen, canWrite } = useKitchenConsoleIdentity()
</script>
