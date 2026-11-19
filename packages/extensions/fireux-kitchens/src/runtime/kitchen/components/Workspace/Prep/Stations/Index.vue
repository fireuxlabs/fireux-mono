<template>
  <WorkspacePageHeader title="Stations" variant="child">
    <template #actions>
      <UButton
        v-if="outcome === 'empty' && canWrite"
        label="Add Pass station"
        :loading="creating"
        @click="addPass"
      />
    </template>
  </WorkspacePageHeader>
  <WorkspaceKitchenToolsToolbar capability="stations" />
  <Stations.Collection />
  <UAlert v-if="defaultStationError" color="error" :title="defaultStationError">
    <template #actions>
      <FireCopyError :message="defaultStationError" />
    </template>
  </UAlert>
  <UAlert
    v-if="readOnly"
    color="neutral"
    variant="soft"
    title="Read only"
    description="This kitchen can be inspected, but changes are disabled."
  />
  <Stations.Ai />
</template>

<script setup lang="ts">
import * as Stations from './index'
import { ref } from 'vue'
import { useKitchenStationCreate } from '../../../../composables/stations/useKitchenStationCreate'
import { provideKitchenWorkspacePrepStationsRead } from '../../../../composables/workspace/prep/stations/read'

const { readOnly, canWrite, outcome, kitchenId } =
  provideKitchenWorkspacePrepStationsRead()
const defaultStationError = ref('')
const creating = ref(false)
const { ensureDefaultStation, captureIntent } = useKitchenStationCreate(
  [kitchenId, canWrite],
  () => {
    defaultStationError.value = ''
    creating.value = false
  }
)
async function addPass() {
  if (creating.value || !canWrite.value) return
  const targetId = kitchenId.value
  const isCurrent = captureIntent()
  creating.value = true
  defaultStationError.value = ''
  try {
    await ensureDefaultStation(targetId)
  } catch (error) {
    if (isCurrent())
      defaultStationError.value =
        error instanceof Error
          ? error.message
          : 'Could not add the Pass station.'
  } finally {
    if (isCurrent()) creating.value = false
  }
}
</script>
