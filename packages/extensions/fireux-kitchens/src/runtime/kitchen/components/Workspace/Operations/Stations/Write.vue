<template>
  <UCard>
    <template #header>
      <div class="workspace-card-header">
        <div class="workspace-card-header__title">Add station</div>
        <p class="workspace-card-header__description">
          Create a simple station for this kitchen.
        </p>
      </div>
    </template>

    <form class="space-y-4" @submit.prevent="addStation">
      <UFormField label="Station name">
        <UInput
          v-model="name"
          placeholder="Grill"
          :disabled="saving || !canCreateStation"
        />
      </UFormField>

      <div class="flex flex-wrap items-center gap-2">
        <UButton
          type="submit"
          :loading="saving"
          :disabled="!canCreateStation || !name.trim()"
        >
          Add station
        </UButton>

        <p v-if="message" class="text-xs text-dimmed">
          {{ message }}
        </p>
      </div>
    </form>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useKitchenWorkspaceStations } from '../../../../composables/workspace/operations/Stations/useKitchenWorkspaceStations'
import { useKitchenStationCreate } from '../../../../composables/workspace/operations/Stations/mutations/useKitchenStationCreate'

const { kitchenId, rootCollection, canWrite, stations } =
  useKitchenWorkspaceStations()
const { createKitchenStation } = useKitchenStationCreate()

const name = ref('')
const saving = ref(false)
const message = ref('')
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

  saving.value = true
  message.value = ''

  try {
    const stationId = await createKitchenStation({
      kitchenId: kitchenId.value,
      kitchenCollectionPath: rootCollection.value,
      name: name.value,
      sortOrder: nextSortOrder.value,
    })
    name.value = ''
    message.value = `Added ${stationId}.`
  } catch (error) {
    message.value = String(
      (error as any)?.message || error || 'Add station failed.'
    )
  } finally {
    saving.value = false
  }
}
</script>
