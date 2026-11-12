<template>
  <UCard>
    <template #header><h2>Preparation Stations</h2></template>
    <FireState
      v-if="!ready"
      :outcome="stationsOutcome"
      entity="Stations"
      :error="stationsError"
    />
    <form
      v-else
      class="workspace-surface workspace-surface--compact"
      @submit.prevent="save"
    >
      <UFormField label="Preparation assignment">
        <USelect
          v-model="mode"
          :items="[
            { value: 'unconfigured', label: 'Not configured' },
            { value: 'specific', label: 'Choose Stations for this Item' },
            { value: 'none', label: 'No preparation required' },
          ]"
          :disabled="busy || !canWrite"
        />
      </UFormField>
      <UFormField v-if="mode === 'specific'" label="Preparation Stations">
        <USelectMenu
          v-model="stationIds"
          multiple
          :items="
            preparationStations.map((station) => ({
              value: station.id,
              label: station.name,
            }))
          "
          value-key="value"
          placeholder="Choose Stations"
          :disabled="busy || !canWrite"
        />
      </UFormField>
      <p v-if="dish.spec?.station" class="fx-type-caption">
        Existing preparation note: {{ dish.spec.station }}. This text has not
        been converted into a Station assignment.
      </p>
      <p class="fx-type-caption">
        These assignments describe preparation responsibility. Printer delivery
        and live Station queues are not enabled here.
      </p>
      <UButton
        v-if="canWrite"
        type="submit"
        label="Save Station assignment"
        :loading="busy"
        :disabled="busy || (mode === 'specific' && !stationIds.length)"
      />
      <p v-if="saved" role="status">{{ saved }}</p>
      <FireCopyError v-if="error" :message="error" />
    </form>
  </UCard>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from '#imports'
import type { Item } from '../../../models/item.model'
import { useKitchenItemPreparation } from '../../../composables/workspace/items/useKitchenItemPreparation'
import { useItemUpdate } from '../../../composables/item/useItemUpdate'
import { useItemEditorScope } from '../../../composables/item/useItemEditorScope'
const props = defineProps<{
  dish: Item
  kitchenId: string
  canWrite: boolean
}>()
const { preparationStations, stationsOutcome, stationsError } =
  useKitchenItemPreparation()
const route = useRoute()
const stationIds = ref<string[]>([]),
  mode = ref('unconfigured'),
  busy = ref(false),
  error = ref(''),
  saved = ref('')
function reset() {
  stationIds.value = [...(props.dish.preparation_station_ids || [])]
  mode.value =
    props.dish.preparation_station_ids === undefined
      ? 'unconfigured'
      : stationIds.value.length
        ? 'specific'
        : 'none'
  busy.value = false
  error.value = ''
  saved.value = ''
}
watch(
  () => [
    props.kitchenId,
    props.dish.id,
    JSON.stringify(props.dish.preparation_station_ids),
  ],
  reset,
  { immediate: true }
)
const ready = computed(() => ['ready', 'empty'].includes(stationsOutcome.value))
const sources = [
  () => props.kitchenId,
  () => props.dish.id,
  () => props.canWrite,
  () => route.fullPath,
]
const capture = useItemEditorScope(sources, reset)
const { updateItem } = useItemUpdate([...sources, stationIds, mode])
async function save() {
  if (
    !props.canWrite ||
    busy.value ||
    !ready.value ||
    (mode.value === 'specific' && !stationIds.value.length)
  )
    return
  const current = capture()
  busy.value = true
  error.value = ''
  saved.value = ''
  try {
    await updateItem(
      props.dish.id,
      {
        preparation_station_ids:
          mode.value === 'unconfigured'
            ? null
            : mode.value === 'none'
              ? []
              : [...stationIds.value],
      },
      { kitchenId: props.kitchenId, isCurrent: current }
    )
    if (current()) saved.value = 'Station assignment saved.'
  } catch (cause) {
    if (current())
      error.value =
        cause instanceof Error ? cause.message : 'Could not save assignments.'
  } finally {
    if (current()) busy.value = false
  }
}
</script>
