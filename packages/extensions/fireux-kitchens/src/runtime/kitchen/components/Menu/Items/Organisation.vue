<template>
  <UCard>
    <template #header><h2>Groups &amp; preparation</h2></template>
    <FireState
      v-if="!ready"
      :outcome="readOutcome"
      entity="Groups and Stations"
      :error="groupsError || stationsError"
    />
    <form
      v-else
      class="workspace-surface workspace-surface--compact"
      @submit.prevent="save"
    >
      <UFormField
        label="Item groups"
        description="Organise this Item independently of Menu sections."
      >
        <USelectMenu
          v-model="groupIds"
          multiple
          :items="
            groups
              .filter((group) => group.active || groupIds.includes(group.id))
              .map((group) => ({ value: group.id, label: group.name }))
          "
          value-key="value"
          placeholder="No group"
          :disabled="busy || !canWrite"
        />
      </UFormField>
      <UFormField label="Preparation assignment">
        <USelect
          v-model="mode"
          :items="[
            { value: 'inherit', label: 'Use group defaults' },
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
      <p v-if="mode === 'inherit'" class="fx-type-caption">
        {{
          inheritedNames.length
            ? `Group defaults: ${inheritedNames.join(', ')}`
            : 'These groups have no preparation Stations configured.'
        }}
      </p>
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
        label="Save groups & preparation"
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
import type { Dish } from '../../../models/dish.model'
import { useKitchenItemOrganisation } from '../../../composables/workspace/dishes/useKitchenItemOrganisation'
import { useDishUpdate } from '../../../composables/dish/useDishUpdate'
import { useDishEditorScope } from '../../../composables/dish/useDishEditorScope'
import { resolveItemPreparationStations } from '../../../utils/item-organisation'
const props = defineProps<{
  dish: Dish
  kitchenId: string
  canWrite: boolean
}>()
const {
  groups,
  groupsOutcome,
  groupsError,
  preparationStations,
  stationsOutcome,
  stationsError,
} = useKitchenItemOrganisation()
const route = useRoute()
const groupIds = ref<string[]>([]),
  stationIds = ref<string[]>([]),
  mode = ref('inherit'),
  busy = ref(false),
  error = ref(''),
  saved = ref('')
function reset() {
  groupIds.value = [...(props.dish.group_ids || [])]
  stationIds.value = [...(props.dish.preparation_station_ids || [])]
  mode.value =
    props.dish.preparation_station_ids === undefined
      ? 'inherit'
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
    JSON.stringify(props.dish.group_ids),
    JSON.stringify(props.dish.preparation_station_ids),
  ],
  reset,
  { immediate: true }
)
const ready = computed(() =>
  [groupsOutcome.value, stationsOutcome.value].every((value) =>
    ['ready', 'empty'].includes(value)
  )
)
const readOutcome = computed(() =>
  [groupsOutcome.value, stationsOutcome.value].includes('error')
    ? 'error'
    : [groupsOutcome.value, stationsOutcome.value].includes('idle')
      ? 'idle'
      : 'pending'
)
const inheritedNames = computed(() =>
  resolveItemPreparationStations(
    { group_ids: groupIds.value },
    groups.value
  ).map(
    (id) =>
      preparationStations.value.find((station) => station.id === id)?.name || id
  )
)
const sources = [
  () => props.kitchenId,
  () => props.dish.id,
  () => props.canWrite,
  () => route.fullPath,
]
const capture = useDishEditorScope(sources, reset)
const { updateDish } = useDishUpdate([...sources, groupIds, stationIds, mode])
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
    await updateDish(
      props.dish.id,
      {
        group_ids: [...groupIds.value],
        preparation_station_ids:
          mode.value === 'inherit'
            ? null
            : mode.value === 'none'
              ? []
              : [...stationIds.value],
      },
      { kitchenId: props.kitchenId, isCurrent: current }
    )
    if (current()) saved.value = 'Groups and preparation saved.'
  } catch (cause) {
    if (current())
      error.value =
        cause instanceof Error ? cause.message : 'Could not save assignments.'
  } finally {
    if (current()) busy.value = false
  }
}
</script>
