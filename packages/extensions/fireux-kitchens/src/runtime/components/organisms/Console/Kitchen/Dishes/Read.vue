<template>
  <div class="space-y-6">
    <OrganismsDishCollectionManager
      :collection="dishes"
      :sections="sections"
      title="Dishes"
      description="Browse dishes for the selected kitchen."
      :link="false"
    />

    <OrganismsDishConsoleCore :collection="dishes" />

    <DevFireuxDebugPanel
      v-if="isDev"
      title="Kitchen dishes"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { useKitchenConsoleDishes } from '../../../../../composables/fireux/app/kitchen-console/useKitchenConsoleDishes'

const { dishes, sections, debug } = useKitchenConsoleDishes()
const isDev = import.meta.dev
</script>
