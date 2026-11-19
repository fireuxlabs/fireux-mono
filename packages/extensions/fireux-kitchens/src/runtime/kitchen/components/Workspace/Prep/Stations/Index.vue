<template>
  <WorkspacePageHeader title="Stations" variant="child" />
  <Stations.Tools />
  <Stations.Collection :stations="stations" :outcome="outcome" />
  <UAlert
    v-if="!kitchenId"
    color="neutral"
    variant="soft"
    title="Read only"
    description="This kitchen can be inspected, but changes are disabled."
  />
  <Stations.Ai />
</template>

<script setup lang="ts">
import * as Stations from './index'
import { provideKitchenWorkspacePrepStationsRead } from '../../../../composables/workspace/prep/stations/read'

const { kitchenId, stations, outcome } =
  provideKitchenWorkspacePrepStationsRead()
</script>
