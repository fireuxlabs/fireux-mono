<template>
  <UCard>
    <template #header>
      <div class="workspace-card-header">
        <div class="workspace-card-header__title">Add station</div>
        <p class="workspace-card-header__description">
          Create a preparation Station such as Kitchen or Bar, or a coordination
          Station such as the Pass.
        </p>
      </div>
    </template>

    <form class="fx-card-body-stack" @submit.prevent="addStation">
      <UFormField label="Station name">
        <UInput
          v-model="name"
          placeholder="Grill"
          :disabled="saving || !canCreateStation"
        />
      </UFormField>

      <UFormField label="Responsibility">
        <USelect
          v-model="role"
          :items="[
            { value: 'preparation', label: 'Prepare assigned Items' },
            { value: 'coordination', label: 'Coordinate whole Orders' },
          ]"
          :disabled="saving || !canCreateStation"
        />
      </UFormField>
      <div class="fx-card__actions">
        <UButton
          type="submit"
          :loading="saving"
          :disabled="!canCreateStation || !name.trim()"
        >
          Add station
        </UButton>

        <p v-if="message">
          {{ message }}
        </p>
      </div>
    </form>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useKitchenWorkspaceStations } from '../../../../composables/workspace/stations/useKitchenWorkspaceStations'
import { useKitchenStationCreate } from '../../../../composables/stations/useKitchenStationCreate'

const { kitchenId, rootCollection, canWrite, stations } =
  useKitchenWorkspaceStations()

const name = ref('')
const role = ref<'preparation' | 'coordination'>('preparation')
const saving = ref(false)
const message = ref('')
const { createKitchenStation, captureIntent } = useKitchenStationCreate(
  [kitchenId, rootCollection, canWrite],
  () => {
    name.value = ''
    role.value = 'preparation'
    message.value = ''
    saving.value = false
  }
)
const canCreateStation = computed(
  () => canWrite.value && Boolean(rootCollection.value && kitchenId.value)
)
const nextSortOrder = computed(() => {
  const orders = stations.value
    .map((station) => Number(station.sort_order))
    .filter((value) => Number.isFinite(value))
  return orders.length ? Math.max(...orders) + 1 : 1
})

const addStation = async () => {
  if (!canCreateStation.value || saving.value) return
  const isCurrent = captureIntent()

  saving.value = true
  message.value = ''

  try {
    const stationId = await createKitchenStation(
      {
        kitchenId: kitchenId.value,
        name: name.value,
        sortOrder: nextSortOrder.value,
        role: role.value,
      },
      isCurrent
    )
    if (!isCurrent()) return
    name.value = ''
    role.value = 'preparation'
    message.value = `Added ${stationId}.`
  } catch (error) {
    if (!isCurrent()) return
    message.value = String(
      (error as any)?.message || error || 'Add station failed.'
    )
  } finally {
    if (isCurrent()) saving.value = false
  }
}
</script>
