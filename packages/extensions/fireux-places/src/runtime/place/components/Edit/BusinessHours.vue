<template>
  <UCard>
    <template #header>
      <div class="card__header">
        <div>
          <h2 class="fx-type-card-heading">{{ title }}</h2>
          <p>The hours guests see on your public page.</p>
        </div>
        <UIcon name="i-lucide-calendar-clock" />
      </div>
    </template>
    <div v-if="showTimezone">
      <FireFormsEditableSimpleField
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
