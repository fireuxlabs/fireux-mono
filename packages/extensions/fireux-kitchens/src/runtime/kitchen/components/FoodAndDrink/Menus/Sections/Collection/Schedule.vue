<template>
  <div v-if="menu" class="workspace-surface workspace-surface--compact">
    <div class="menu-editor-actions">
      <div class="menu-editor-actions">
        <UIcon
          :name="daily ? 'i-lucide-calendar-days' : 'i-lucide-book-open'"
          class="menu-schedule-icon"
        />
        <span class="fx-type-card-heading">{{
          daily ? 'Daily menu' : 'Regular menu'
        }}</span>
      </div>
    </div>
    <template v-if="daily">
      <KitchenFoodAndDrinkMenusSectionsCollectionWeek v-model="date" />
      <details v-if="canWrite">
        <summary class="menu-schedule-summary">Add selection</summary>
        <div class="workspace-surface workspace-surface--compact">
          <div class="menu-editor-controls">
            <UFormField label="Selection"
              ><UInput v-model="label" placeholder="Lunch, dinner or specials"
            /></UFormField>
            <UButton
              label="Add selection"
              icon="i-lucide-plus"
              :loading="saving"
              :disabled="!canWrite || !label.trim() || !isMenuDate(date)"
              @click="addDay"
            />
          </div>
        </div>
      </details>
      <details
        v-if="canWrite && sections.some((section) => section.date === date)"
      >
        <summary class="menu-schedule-summary">Copy to another date</summary>
        <div class="menu-editor-controls">
          <UFormField label="Copy to"
            ><UInput v-model="copyTo" type="date"
          /></UFormField>
          <UButton
            label="Copy selections"
            :loading="saving"
            :disabled="!canWrite || !isMenuDate(copyTo) || copyTo === date"
            @click="copyDay"
          />
        </div>
      </details>
    </template>
    <UAlert v-if="error" color="error" title="Could not save menu"
      ><template #description><FireCopyError :message="error" /></template
    ></UAlert>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useKitchenMenuRecordContext } from '../../../../../composables/workspace/menus/useKitchenMenuRecordContext'
import { useMenuSchedule } from '../../../../../../menu/composables/useMenuSchedule'
import { useMenuEditorScope } from '../../../../../../menu/composables/useMenuEditorScope'
import { isMenuDate } from '../../../../../../menu/utils/menu-date'
const date = defineModel<string>({ required: true })
const { menu, menuId, kitchenId, sections, canWrite } =
  useKitchenMenuRecordContext()
const { configure } = useMenuSchedule()
const daily = computed(() => menu.value?.schedule === 'daily')
const label = ref('')
const copyTo = ref('')
const saving = ref(false)
const error = ref('')
const captureScope = useMenuEditorScope(
  [kitchenId, menuId, date, copyTo],
  () => {
    saving.value = false
    error.value = ''
  }
)
async function save(input: {
  schedule?: 'daily'
  date?: string
  label?: string
  copyFrom?: string
}) {
  const isCurrent = captureScope()
  saving.value = true
  error.value = ''
  try {
    await configure({
      kitchenId: kitchenId.value,
      menuId: menuId.value,
      ...input,
    })
    return isCurrent()
  } catch (cause) {
    if (isCurrent())
      error.value = cause instanceof Error ? cause.message : String(cause)
    return false
  } finally {
    if (isCurrent()) saving.value = false
  }
}
const addDay = async () => {
  await save({ date: date.value, label: label.value.trim() })
}
const copyDay = async () => {
  const destination = copyTo.value
  if (await save({ date: destination, copyFrom: date.value }))
    date.value = destination
}
</script>

<style scoped>
.menu-schedule-icon {
  inline-size: 1.25rem;
  block-size: 1.25rem;
  color: var(--ui-primary);
}
.menu-schedule-summary {
  cursor: pointer;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
}
</style>
