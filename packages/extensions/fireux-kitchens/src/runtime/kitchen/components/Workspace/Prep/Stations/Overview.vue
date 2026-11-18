<template>
  <UPageCard
    title="Stations"
    to="/workspace/kitchen/stations"
    icon="i-lucide-panels-top-left"
  >
    <p :role="overview.role">
      {{ overview.message }}
    </p>
    <ul v-if="overview.flags.length">
      <li v-for="flag in overview.flags" :key="flag">{{ flag }}</li>
    </ul>
  </UPageCard>
</template>
<script setup lang="ts">
import { useKitchenWorkspacePrepStationsOverview } from './useOverview'

const { overview } = useKitchenWorkspacePrepStationsOverview()
</script>
