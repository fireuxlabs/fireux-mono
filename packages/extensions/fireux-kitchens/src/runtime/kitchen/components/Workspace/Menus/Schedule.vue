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
      <div class="flex flex-wrap items-center gap-2">
        <UButton
          icon="i-lucide-chevron-left"
          aria-label="Previous week"
          color="neutral"
          variant="ghost"
          :disabled="!isMenuDate(date)"
          @click="date = shiftMenuDate(date, -7)"
        />
        <UInput v-model="date" type="date" aria-label="Menu date" />
        <UButton
          icon="i-lucide-chevron-right"
          aria-label="Next week"
          color="neutral"
          variant="ghost"
          :disabled="!isMenuDate(date)"
          @click="date = shiftMenuDate(date, 7)"
        />
        <UButton
          label="Today"
          color="neutral"
          variant="soft"
          @click="date = today"
        />
      </div>
      <div class="grid grid-cols-7 gap-1" aria-label="Menu week">
        <button
          v-for="day in week"
          :key="day"
          type="button"
          :aria-pressed="day === date"
          :class="[
            'rounded-xl border p-2 text-center transition-colors',
            day === date
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-default hover:bg-elevated',
          ]"
          @click="date = day"
        >
          <span class="block text-xs">{{ weekday(day) }}</span>
          <span class="block text-lg font-semibold">{{
            Number(day.slice(-2))
          }}</span>
          <span
            :class="[
              'mx-auto mt-1 block size-1.5 rounded-full',
              sections.some((section) => section.date === day)
                ? 'bg-primary'
                : 'bg-transparent',
            ]"
          />
        </button>
      </div>
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
import { useKitchenWorkspaceMenu } from '../../../composables/workspace/menus/useKitchenWorkspaceMenu'
import { useMenuSchedule } from '../../../../menu/composables/useMenuSchedule'
import { isMenuDate, shiftMenuDate } from '../../../../menu/utils/menu-date'
const date = defineModel<string>({ required: true })
const { menu, menuId, kitchenId, sections, canWrite } =
  useKitchenWorkspaceMenu()
const { configure } = useMenuSchedule()
const daily = computed(() => menu.value?.schedule === 'daily')
const today = new Date().toLocaleDateString('en-CA')
const label = ref('')
const copyTo = ref('')
const saving = ref(false)
const error = ref('')
const week = computed(() => {
  const value = isMenuDate(date.value) ? date.value : today
  const day = new Date(`${value}T12:00:00Z`).getUTCDay()
  const monday = shiftMenuDate(value, -((day + 6) % 7))
  return Array.from({ length: 7 }, (_, index) => shiftMenuDate(monday, index))
})
const weekday = (day: string) =>
  new Date(`${day}T12:00:00Z`).toLocaleDateString('en', {
    weekday: 'short',
    timeZone: 'UTC',
  })
async function save(input: {
  schedule?: 'daily'
  date?: string
  label?: string
  copyFrom?: string
}) {
  saving.value = true
  error.value = ''
  try {
    await configure({
      kitchenId: kitchenId.value,
      menuId: menuId.value,
      ...input,
    })
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause)
  } finally {
    saving.value = false
  }
}
const changeSchedule = () => save({ schedule: 'daily' })
const addDay = () => save({ date: date.value, label: label.value.trim() })
const copyDay = async () => {
  await save({ date: copyTo.value, copyFrom: date.value })
  if (!error.value) date.value = copyTo.value
}
</script>
