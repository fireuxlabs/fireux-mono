<template>
  <div class="space-y-6">
    <OrganismsStationCollectionManager
      :collection="stations"
      title="Stations"
      description="Kitchen work areas for the selected kitchen."
    />

    <DevFireuxDebugPanel
      v-if="isDev"
      title="Kitchen stations"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { useKitchenConsoleStations } from '../../../../../composables/fireux/app/kitchen-console/useKitchenConsoleStations'
import StationCollectionManager from '../../../Station/Collection/Manager.vue'

const { stations, debug } = useKitchenConsoleStations()
const isDev = import.meta.dev
</script>
