<template>
  <div class="workspace-surface workspace-surface--compact">
    <p>
      Groups organise your Items. Their names do not determine preparation or
      service behaviour.
    </p>
    <UButton to="/workspace/kitchen/stations" label="Manage Stations" variant="link" color="neutral" />
    <FireState
      v-if="!ready"
      :outcome="groupsOutcome"
      entity="Item groups"
      :error="groupsError"
    />
    <form
      v-else
      class="workspace-surface workspace-surface--compact"
      @submit.prevent="submit"
    >
      <UFormField label="Group">
        <USelect
          v-model="selectedId"
          :items="[
            { value: '__new__', label: 'Create a group' },
            ...groups.map((group) => ({ value: group.id, label: group.name })),
          ]"
          :disabled="busy || readOnly"
        />
      </UFormField>
      <UFormField label="Name" required>
        <UInput
          v-model="name"
          placeholder="Food, Drinks, Merchandise…"
          :maxlength="100"
          :disabled="busy || readOnly"
        />
      </UFormField>
      <UFormField
        label="Default preparation Stations"
        description="Optional. Items in this group can inherit these Stations or use their own assignment."
      >
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
          placeholder="No preparation default"
          :disabled="busy || readOnly || !stationsReady"
        />
      </UFormField>
      <FireState
        v-if="!stationsReady"
        :outcome="stationsOutcome"
        entity="Stations"
        :error="stationsError"
      />
      <UButton
        type="submit"
        :label="selectedId === '__new__' ? 'Create group' : 'Save group'"
        :loading="busy"
        :disabled="busy || readOnly || !name.trim() || !stationsReady"
      />
      <p v-if="saved" role="status">{{ saved }}</p>
      <FireCopyError v-if="error" :message="error" />
    </form>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from '#imports'
import { useKitchenDishesContext } from '../../../composables/workspace/dishes/useKitchenDishesContext'
import { useKitchenItemOrganisation } from '../../../composables/workspace/dishes/useKitchenItemOrganisation'
import { useKitchenItemGroupCommands } from '../../../composables/workspace/dishes/useKitchenItemGroupCommands'
import { useDishEditorScope } from '../../../composables/dish/useDishEditorScope'
const { kitchenId, readOnly } = useKitchenDishesContext()
const {
  groups,
  groupsOutcome,
  groupsError,
  preparationStations,
  stationsOutcome,
  stationsError,
} = useKitchenItemOrganisation()
const route = useRoute()
const selectedId = ref('__new__'),
  name = ref(''),
  stationIds = ref<string[]>([]),
  busy = ref(false),
  error = ref(''),
  saved = ref('')
const ready = computed(() => ['ready', 'empty'].includes(groupsOutcome.value))
const stationsReady = computed(() =>
  ['ready', 'empty'].includes(stationsOutcome.value)
)
watch(selectedId, () => {
  const group = groups.value.find((group) => group.id === selectedId.value)
  name.value = group?.name || ''
  stationIds.value = [...(group?.default_station_ids || [])]
  error.value = ''
  saved.value = ''
})
const ownerSources = [kitchenId, () => route.fullPath, readOnly]
const capture = useDishEditorScope(ownerSources, () => {
  selectedId.value = '__new__'
  name.value = ''
  stationIds.value = []
  busy.value = false
  error.value = ''
  saved.value = ''
})
const { save } = useKitchenItemGroupCommands([
  ...ownerSources,
  selectedId,
  name,
  stationIds,
])
async function submit() {
  if (
    busy.value ||
    readOnly.value ||
    !ready.value ||
    !stationsReady.value ||
    !name.value.trim()
  )
    return
  const current = capture()
  busy.value = true
  error.value = ''
  saved.value = ''
  try {
    await save(
      {
        kitchenId: kitchenId.value,
        ...(selectedId.value !== '__new__'
          ? { groupId: selectedId.value }
          : {}),
        name: name.value.trim(),
        default_station_ids: [...stationIds.value],
      },
      current
    )
    if (current()) {
      saved.value = 'Group saved.'
      if (selectedId.value === '__new__') {
        name.value = ''
        stationIds.value = []
      }
    }
  } catch (cause) {
    if (current())
      error.value =
        cause instanceof Error ? cause.message : 'Could not save group.'
  } finally {
    if (current()) busy.value = false
  }
}
</script>
