<template>
  <div class="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
    <main class="space-y-8">
      <section v-if="place.about" class="space-y-3">
        <h2 class="text-xl font-semibold">
          About {{ place.short_name || place.name }}
        </h2>
        <p class="text-muted">{{ place.about }}</p>
      </section>
      <PlaceDetailGallery
        v-if="place.gallery_images.length"
        :name="place.name"
        :images="place.gallery_images"
      />
    </main>
    <PlaceDetailVisitInfo
      :place="place"
      :website-label="websiteLabel"
      :has-visit-details="hasVisitDetails"
      :facts="facts"
      :hours="hours"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type {
  Place,
  PlaceBusinessHoursDay,
  PlaceBusinessHoursWindow,
} from '../../models/place.model.ts'

const props = defineProps<{ place: Place }>()
const websiteLabel = computed(() => {
  const value = String(props.place.website || '').trim()
  if (!value) return ''
  try {
    return new URL(value).hostname.replace(/^www\./, '')
  } catch {
    return value
  }
})
const hasVisitDetails = computed(() =>
  Boolean(
    props.place.short_address ||
      props.place.website ||
      (!props.place.business_hours.windows.length &&
        props.place.place_type === 'physical')
  )
)
const facts = computed(
  () =>
    [
      props.place.short_name && props.place.short_name !== props.place.name
        ? { label: 'Also known as', value: props.place.short_name }
        : null,
      props.place.default_currency_code
        ? { label: 'Currency', value: props.place.default_currency_code }
        : null,
      props.place.timezone
        ? { label: 'Time zone', value: props.place.timezone }
        : null,
    ].filter(Boolean) as Array<{ label: string; value: string }>
)
const dayLabels: Record<PlaceBusinessHoursDay, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
}
const formatWindow = (window: PlaceBusinessHoursWindow) =>
  window.open === '00:00' && window.close === '00:00'
    ? 'Open 24 hours'
    : `${window.open}–${window.close}`
const hours = computed(() =>
  props.place.business_hours.windows.map((window) => ({
    days: window.days.map((day) => dayLabels[day]).join(', '),
    time: formatWindow(window),
  }))
)
</script>
