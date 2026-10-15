<template>
  <div class="space-y-3" aria-label="Choose Menu date">
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
        @click="date = timezone ? menuLocalDate(timezone) : ''"
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
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenMenuRecordContext } from '../../../../../composables/workspace/menus/useKitchenMenuRecordContext'
import {
  isMenuDate,
  shiftMenuDate,
} from '../../../../../../menu/utils/menu-date'
import { menuLocalDate } from '../../../../../../menu/utils/daily-menu'
const date = defineModel<string>({ required: true })
const { timezone, sections } = useKitchenMenuRecordContext()
const today = computed(() =>
  timezone.value ? menuLocalDate(timezone.value) : ''
)
const week = computed(() => {
  const value = isMenuDate(date.value) ? date.value : today.value
  if (!isMenuDate(value)) return []
  const day = new Date(`${value}T12:00:00Z`).getUTCDay()
  const monday = shiftMenuDate(value, -((day + 6) % 7))
  return Array.from({ length: 7 }, (_, index) => shiftMenuDate(monday, index))
})
const weekday = (day: string) =>
  new Date(`${day}T12:00:00Z`).toLocaleDateString('en', {
    weekday: 'short',
    timeZone: 'UTC',
  })
</script>
