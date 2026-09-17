<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold text-highlighted">{{ title }}</h2>
          <p class="mt-1 text-sm text-muted">
            The hours guests see on your public page.
          </p>
        </div>
        <UIcon name="i-lucide-calendar-clock" class="size-6 text-muted" />
      </div>
    </template>
    <div v-if="showTimezone" class="mb-6 max-w-sm">
      <MoleculesFormsEditableSimpleField
        label="Timezone"
        :value="timezone"
        placeholder="Europe/Zurich"
        :update="saveTimezone"
      />
    </div>
    <PlaceOpeningHoursSchedule
      :key="place.id"
      :hours="hours"
      :timezone="timezone"
      :update="saveHours"
      :compact="compact"
    />
  </UCard>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import {
  usePlaceUpdate,
  type PlaceMutationAuthority,
} from '../../composables/firestore/mutations/usePlaceUpdate'
import type { Place, PlaceBusinessHours } from '../../models/place.model'
import { normalizePlaceBusinessHours } from '../../utils/place-spine'
const props = withDefaults(
  defineProps<{
    place: Place
    mutationAuthority?: PlaceMutationAuthority | null
    title?: string
    showTimezone?: boolean
    compact?: boolean
  }>(),
  { title: 'Weekly opening hours', showTimezone: true, compact: false }
)
const { updateBusinessHours, updateTimezone } = usePlaceUpdate({
  authority: () => props.mutationAuthority,
})
const timezone = computed(() => props.place.timezone || '')
const hours = computed(
  () =>
    normalizePlaceBusinessHours(props.place.business_hours) || { windows: [] }
)
async function saveTimezone(value: string) {
  await updateTimezone(value, { id: props.place.id })
}
async function saveHours(value: PlaceBusinessHours) {
  await updateBusinessHours(value, { id: props.place.id })
}
</script>
