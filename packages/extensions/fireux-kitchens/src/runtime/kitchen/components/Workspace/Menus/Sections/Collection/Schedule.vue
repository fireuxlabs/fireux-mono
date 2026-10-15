<template>
  <div v-if="menu" class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <UIcon
          :name="daily ? 'i-lucide-calendar-days' : 'i-lucide-book-open'"
          class="size-5 text-primary"
        />
        <span class="font-semibold">{{
          daily ? 'Daily menu' : 'Regular menu'
        }}</span>
      </div>
      <UButton
        v-if="
          !daily && !sections.length && menu.status !== 'published' && canWrite
        "
        label="Use daily selections"
        icon="i-lucide-calendar-plus"
        variant="soft"
        :loading="saving"
        @click="changeSchedule"
      />
    </div>
    <template v-if="daily">
      <WorkspaceKitchenMenusSectionsCollectionWeek v-model="date" />
      <details>
        <summary class="cursor-pointer text-sm font-medium">
          Add selection
        </summary>
        <div class="mt-3">
          <div class="flex flex-wrap items-end gap-3">
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
      <details v-if="sections.some((section) => section.date === date)">
        <summary class="cursor-pointer text-sm text-muted">
          Copy to another date
        </summary>
        <div class="mt-3 flex flex-wrap items-end gap-2">
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
      ><template #description><MoleculesCopyError :message="error" /></template
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
const changeSchedule = async () => {
  await save({ schedule: 'daily' })
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
