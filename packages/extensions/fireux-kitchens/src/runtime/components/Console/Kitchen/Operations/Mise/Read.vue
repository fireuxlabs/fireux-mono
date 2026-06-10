<template>
  <div class="space-y-6">
    <ConsoleKitchenOperationsMiseCollectionManager
      :collection="miseTasks"
      title="Mise Tasks"
      description="Browse mise tasks for the selected kitchen."
      :link="true"
    />

    <DevFireuxDebugPanel
      title="Kitchen mise"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { useKitchenConsoleMise } from '../../../../../composables/fireux/console/kitchen/Operations/Mise/useKitchenConsoleMise'

const { miseTasks, debug } = useKitchenConsoleMise()
</script>
