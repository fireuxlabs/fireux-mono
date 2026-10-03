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
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useKitchenWorkspaceStations } from '../../../composables/workspace/stations/useKitchenWorkspaceStations'
import { useKitchenStationCreate } from '../../../composables/stations/useKitchenStationCreate'

const { kitchenId, rootCollection, canWrite, stations } =
  useKitchenWorkspaceStations()
const { createKitchenStation } = useKitchenStationCreate()

const name = ref('')
const saving = ref(false)
const message = ref('')
const { currentUser } = useAuth()
let revision = 0
watch(
  [kitchenId, rootCollection, () => currentUser.value?.uid || ''],
  () => {
    revision += 1
    name.value = ''
    message.value = ''
    saving.value = false
  },
  { flush: 'sync' }
)
onBeforeUnmount(() => {
  revision += 1
})
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
  const requestedRevision = revision

  saving.value = true
  message.value = ''

  try {
    const stationId = await createKitchenStation({
      kitchenId: kitchenId.value,
      name: name.value,
      sortOrder: nextSortOrder.value,
    })
    if (requestedRevision !== revision) return
    name.value = ''
    message.value = `Added ${stationId}.`
  } catch (error) {
    if (requestedRevision !== revision) return
    message.value = String(
      (error as any)?.message || error || 'Add station failed.'
    )
  } finally {
    if (requestedRevision === revision) saving.value = false
  }
}
</script>
