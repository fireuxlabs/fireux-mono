<template>
  <div
    class="workspace-surface workspace-surface--compact"
    aria-label="Choose Menu date"
  >
    <div class="menu-week__controls">
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
    <div class="menu-week" aria-label="Menu week">
      <button
        v-for="day in week"
        :key="day"
        type="button"
        :aria-pressed="day === date"
        class="menu-week__day"
        @click="date = day"
      >
        <span class="menu-week__weekday">{{ weekday(day) }}</span>
        <span class="menu-week__date">{{ Number(day.slice(-2)) }}</span>
        <span
          class="menu-week__marker"
          :data-has-selections="
            sections.some((section) => section.date === day)
          "
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

<style scoped>
.menu-week__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: calc(var(--spacing) * 2);
}
.menu-week {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: var(--spacing);
}
.menu-week__day {
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius);
  padding: calc(var(--spacing) * 2);
  text-align: center;
  cursor: pointer;
}
.menu-week__day:hover {
  background: var(--ui-bg-elevated);
}
.menu-week__day[aria-pressed='true'] {
  border-color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 10%, transparent);
  color: var(--ui-primary);
}
.menu-week__weekday,
.menu-week__date {
  display: block;
}
.menu-week__weekday {
  font-size: var(--text-xs);
}
.menu-week__date {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
}
.menu-week__marker {
  display: block;
  margin: var(--spacing) auto 0;
  inline-size: calc(var(--spacing) * 1.5);
  block-size: calc(var(--spacing) * 1.5);
  border-radius: 50%;
}
.menu-week__marker[data-has-selections='true'] {
  background: var(--ui-primary);
}
</style>
