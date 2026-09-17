<template>
  <div class="hours-week" :class="{ 'hours-week--compact': compact }">
    <div v-for="day in openingDays" :key="day" class="hours-day">
      <span class="font-medium text-highlighted">{{ label(day) }}</span>
      <div class="hours-day__times">
        <template v-if="rangesFor(day).length">
          <span v-for="(range, index) in rangesFor(day)" :key="index">
            <template v-if="range.open === '00:00' && range.close === '00:00'"
              >Open 24 hours</template
            >
            <template v-else
              >{{ range.open }} <span class="text-muted">–</span>
              {{ range.close }}
              <small v-if="range.close <= range.open" class="text-muted"
                >next day</small
              ></template
            >
          </span>
        </template>
        <span v-else class="text-muted">{{
          hours.windows.length ? 'Closed' : 'Not set'
        }}</span>
      </div>
      <UButton
        icon="i-lucide-pencil"
        :aria-label="`Edit ${label(day)} hours`"
        color="neutral"
        variant="ghost"
        size="sm"
        v-if="editable"
        :disabled="disabled"
        @click="$emit('edit', day)"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import type {
  PlaceBusinessHours,
  PlaceBusinessHoursDay,
} from '../../models/place.model'
import { openingDays } from '../../utils/opening-hours-editor'
const props = withDefaults(
  defineProps<{
    hours: PlaceBusinessHours
    editable?: boolean
    disabled?: boolean
    compact?: boolean
  }>(),
  { editable: false, disabled: false, compact: false }
)
defineEmits<{ edit: [day: PlaceBusinessHoursDay] }>()
const label = (day: string) => day.charAt(0).toUpperCase() + day.slice(1)
const rangesFor = (day: PlaceBusinessHoursDay) =>
  props.hours.windows
    .filter((window) => window.days.includes(day))
    .slice()
    .sort((a, b) => a.open.localeCompare(b.open))
</script>
<style scoped>
.hours-day {
  display: grid;
  grid-template-columns: minmax(6rem, 1fr) minmax(0, 2fr) auto;
  gap: 1rem;
  align-items: center;
  padding: 1rem 0;
  border-top: 1px solid var(--ui-border);
  font-size: 0.875rem;
}
.hours-day__times {
  display: grid;
  gap: 0.35rem;
  font-variant-numeric: tabular-nums;
}
.hours-week--compact .hours-day {
  padding-block: 0.4rem;
  gap: 0.75rem;
}
@media (max-width: 30rem) {
  .hours-day {
    gap: 0.5rem;
    grid-template-columns: 5.5rem minmax(0, 1fr) auto;
  }
}
</style>
