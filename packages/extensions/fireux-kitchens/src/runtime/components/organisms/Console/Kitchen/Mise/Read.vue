<template>
  <div class="space-y-6">
    <OrganismsMiseCollectionManager
      :collection="miseTasks"
      title="Mise Tasks"
      description="Browse mise tasks for the selected kitchen."
      :link="true"
    />

    <OrganismsMiseConsoleCore
      :collection="miseTasks"
      :can-write="canWrite"
    />

    <DevFireuxDebugPanel
      v-if="isDev"
      title="Kitchen mise"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { useKitchenConsoleMise } from '../../../../../composables/fireux/app/kitchen-console/useKitchenConsoleMise'

const { miseTasks, canWrite, debug } = useKitchenConsoleMise()
const isDev = import.meta.dev
</script>
