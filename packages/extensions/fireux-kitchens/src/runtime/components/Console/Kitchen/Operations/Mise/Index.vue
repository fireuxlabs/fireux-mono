<template>
  <section class="console-surface space-y-6">
    <ConsoleKitchenOperationsMiseRead />

    <UAlert
      v-if="readOnly"
      color="neutral"
      variant="soft"
      title="Read only"
      description="This kitchen can be inspected, but changes are disabled."
    />

    <ConsoleKitchenOperationsMiseWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleMise } from '../../../../../composables/fireux/console/kitchen/operations/Mise/useKitchenConsoleMise'

const { readOnly, canWrite } = useKitchenConsoleMise()
</script>
