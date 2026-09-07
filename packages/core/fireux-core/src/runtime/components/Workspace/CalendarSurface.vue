<template>
  <section class="min-w-0 space-y-4" aria-label="Calendar">
    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h1 class="text-xl font-semibold text-highlighted" aria-live="polite">
            {{ monthLabel }}
          </h1>
          <div class="flex items-center gap-2">
            <UButton
              label="Today"
              color="neutral"
              variant="ghost"
              @click="choose(todayKey)"
            />
            <UButton
              icon="i-lucide-chevron-left"
              aria-label="Previous month"
              color="neutral"
              variant="soft"
              @click="moveMonth(-1)"
            />
            <UButton
              icon="i-lucide-chevron-right"
              aria-label="Next month"
              color="neutral"
              variant="soft"
              @click="moveMonth(1)"
            />
          </div>
        </div>
      </template>
      <div class="calendar-weekdays" aria-hidden="true">
        <span v-for="day in weekdays" :key="day">{{ day }}</span>
      </div>
      <div class="calendar-days" role="group" :aria-label="monthLabel">
        <button
          v-for="day in days"
          :key="day.key"
          type="button"
          class="calendar-day"
          :class="{
            'is-selected': day.key === modelValue,
            'is-outside': !day.inMonth,
            'is-today': day.key === todayKey,
          }"
          :aria-label="day.label"
          :aria-pressed="day.key === modelValue"
          @click="choose(day.key)"
        >
          <span>{{ day.number }}</span>
          <span v-if="day.key === todayKey" class="calendar-today">Today</span>
        </button>
      </div>
    </UCard>
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h2 class="font-medium text-highlighted">{{ selectedLabel }}</h2>
      <UInput
        :model-value="modelValue"
        type="date"
        aria-label="Calendar date"
        @update:model-value="choose(String($event))"
      />
    </div>
    <slot />
  </section>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
const todayKey = dateKey(new Date())
const parseDate = (value: string) => new Date(`${value}T12:00:00`)
const month = ref(parseDate(props.modelValue || todayKey))
const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const longDate = (date: Date) =>
  new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
const monthLabel = computed(() =>
  new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(
    month.value
  )
)
const selectedLabel = computed(() =>
  longDate(parseDate(props.modelValue || todayKey))
)
watch(
  () => props.modelValue,
  (value: string) => {
    const date = parseDate(value)
    if (!Number.isNaN(date.getTime())) month.value = date
  }
)
const days = computed(() => {
  const first = new Date(
    month.value.getFullYear(),
    month.value.getMonth(),
    1,
    12
  )
  first.setDate(first.getDate() - ((first.getDay() + 6) % 7))
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(first)
    date.setDate(first.getDate() + index)
    return {
      key: dateKey(date),
      number: date.getDate(),
      inMonth: date.getMonth() === month.value.getMonth(),
      label: longDate(date),
    }
  })
})
function choose(value: string) {
  const date = parseDate(value)
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    Number.isNaN(date.getTime()) ||
    dateKey(date) !== value
  )
    return
  month.value = date
  emit('update:modelValue', value)
}
function moveMonth(delta: number) {
  month.value = new Date(
    month.value.getFullYear(),
    month.value.getMonth() + delta,
    1,
    12
  )
}
</script>
<style scoped>
.calendar-weekdays,
.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
}
.calendar-weekdays {
  padding: calc(var(--spacing) * 3) 0;
  text-align: center;
  font-size: var(--text-xs);
  color: var(--ui-text-muted);
}
.calendar-day {
  min-height: 5rem;
  padding: calc(var(--spacing) * 3);
  text-align: left;
  border-top: 1px solid var(--ui-border);
  border-right: 1px solid var(--ui-border);
  display: flex;
  flex-direction: column;
  gap: var(--spacing);
  cursor: pointer;
}
.calendar-day:nth-child(7n) {
  border-right: 0;
}
.calendar-day:hover {
  background: var(--ui-bg-elevated);
}
.calendar-day:focus-visible {
  outline: 2px solid var(--ui-primary);
  outline-offset: -2px;
}
.calendar-day.is-selected {
  background: var(--ui-bg-elevated);
  box-shadow: inset 0 0 0 2px var(--ui-primary);
}
.calendar-day.is-outside {
  color: var(--ui-text-dimmed);
}
.calendar-day.is-today > span:first-child {
  color: var(--ui-primary);
  font-weight: var(--font-weight-bold);
}
.calendar-today {
  font-size: 0.625rem;
  color: var(--ui-text-muted);
}
@media (max-width: 639px) {
  .calendar-day {
    min-height: 3.5rem;
    padding: calc(var(--spacing) * 2);
  }
  .calendar-today {
    display: none;
  }
}
</style>
