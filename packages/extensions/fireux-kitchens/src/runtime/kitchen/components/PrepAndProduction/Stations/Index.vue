<template>
  <section class="workspace-surface">
    <UAlert
      v-if="defaultStationError"
      color="error"
      :title="defaultStationError"
    />
    <FireCopyError
      v-if="defaultStationError"
      :message="defaultStationError"
    />
    <UButton
      v-if="outcome === 'empty' && canWrite"
      label="Add Pass station"
      :loading="creating"
      @click="addPass"
    />
    <KitchenPrepAndProductionStationsCollection />

    <UAlert
      v-if="readOnly"
      color="neutral"
      variant="soft"
      title="Read only"
      description="This kitchen can be inspected, but changes are disabled."
    />
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useKitchenStationCreate } from '../../../composables/stations/useKitchenStationCreate'
import { useKitchenWorkspaceStations } from '../../../composables/workspace/stations/useKitchenWorkspaceStations'

const { readOnly, canWrite, outcome, kitchenId } = useKitchenWorkspaceStations()
const { ensureDefaultStation } = useKitchenStationCreate()
const defaultStationError = ref('')
const creating = ref(false)
async function addPass() {
  if (creating.value || !canWrite.value) return
  const targetId = kitchenId.value
  creating.value = true
  defaultStationError.value = ''
  try {
    await ensureDefaultStation(targetId)
  } catch (error) {
    if (kitchenId.value === targetId)
      defaultStationError.value =
        error instanceof Error
          ? error.message
          : 'Could not add the Pass station.'
  } finally {
    creating.value = false
  }
}
</script>
