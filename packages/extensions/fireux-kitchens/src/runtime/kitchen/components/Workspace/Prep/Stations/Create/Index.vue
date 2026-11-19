<template>
  <form class="fx-card-body-stack" @submit.prevent="addStation">
    <UFormField label="Station name" required>
      <UInput v-model="name" :disabled="saving || !kitchenId" />
    </UFormField>
    <div class="fx-card__actions">
      <UButton
        type="submit"
        :loading="saving"
        :disabled="!kitchenId || !name.trim()"
      >
        Add station
      </UButton>
    </div>
    <p v-if="message" role="status">{{ message }}</p>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useKitchenWorkspacePrepStationsRead } from '../../../../../composables/workspace/prep/stations/read'
import { useKitchenStationCreate } from '../../../../../composables/stations/useKitchenStationCreate'

const { kitchenId } = useKitchenWorkspacePrepStationsRead()

const name = ref('')
const saving = ref(false)
const message = ref('')
const { createKitchenStation, captureIntent } = useKitchenStationCreate(
  [kitchenId],
  () => {
    name.value = ''
    message.value = ''
    saving.value = false
  }
)
const addStation = async () => {
  const stationName = name.value.trim()
  if (!kitchenId.value || !stationName || saving.value) return
  const isCurrent = captureIntent()

  saving.value = true
  message.value = ''

  try {
    await createKitchenStation(
      {
        kitchenId: kitchenId.value,
        name: stationName,
      },
      isCurrent
    )
    if (!isCurrent()) return
    name.value = ''
    message.value = `Added ${stationName}.`
  } catch (error) {
    if (!isCurrent()) return
    message.value =
      error instanceof Error ? error.message : 'Add station failed.'
  } finally {
    if (isCurrent()) saving.value = false
  }
}
</script>
