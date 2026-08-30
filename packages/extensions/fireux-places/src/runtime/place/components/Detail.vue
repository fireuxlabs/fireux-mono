<template>
  <article class="place-detail__page" :style="detailStyle">
    <!-- 01 Identity -->
    <div class="place-detail__hero">
      <nav class="place-detail__toolbar" aria-label="Place directory">
        <UButton
          to="/places"
          label="All places"
          icon="i-lucide-arrow-left"
          color="neutral"
          variant="ghost"
          size="sm"
          class="place-detail__back"
        />
        <div class="place-detail__toolbar-actions">
          <UButton
            v-if="canEdit"
            :to="editTo"
            label="Edit Place"
            icon="i-lucide-pencil"
            color="neutral"
            variant="solid"
            size="sm"
          />
        </div>
      </nav>
      <PlaceHeader :place="place" />
    </div>

    <!-- 02 Information -->
    <div
      class="place-detail__content"
      :class="{
        'place-detail__content--information-only': !hasEditorialContent,
      }"
    >
      <main v-if="hasEditorialContent" class="place-detail__editorial">
        <section v-if="place.about" class="place-detail__about">
          <h2 class="fx-type-section-title">
            About {{ place.short_name || place.name }}
          </h2>
          <p class="place-detail__story fx-type-body">{{ place.about }}</p>
        </section>
        <PlaceDetailGallery
          v-if="place.gallery_images.length"
          :name="place.name"
          :images="place.gallery_images"
        />
      </main>
      <PlaceDetailVisitInfo
        :class="{ 'place-visit-info--wide': !hasEditorialContent }"
        :place="place"
        :website-label="websiteLabel"
        :has-visit-details="hasVisitDetails"
        :facts="facts"
        :hours="hoursRows"
      />
    </div>

    <!-- 03 Actions -->
    <PlaceDelete :place="place" />
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type {
  Place,
  PlaceBusinessHoursDay,
  PlaceBusinessHoursWindow,
} from '../models/place.model.ts'

defineOptions({ name: 'PlaceDetail' })
const props = defineProps<{ place: Place; canEdit?: boolean }>()

const detailStyle = computed(() =>
  props.place.media_backdrop_color
    ? { '--fx-entity-media-bg': props.place.media_backdrop_color }
    : undefined
)
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
      props.place.short_name &&
      props.place.short_name.localeCompare(props.place.name, undefined, {
        sensitivity: 'base',
      }) !== 0
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
const orderedDays = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const satisfies readonly PlaceBusinessHoursDay[]
const dayLabels: Record<PlaceBusinessHoursDay, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
}
function formatDays(value: PlaceBusinessHoursDay[]) {
  const days = orderedDays.filter((day) => value.includes(day))
  if (days.length === orderedDays.length) return 'Every day'
  if (!days.length) return ''
  const indexes = days.map((day) => orderedDays.indexOf(day))
  const contiguous = indexes.every(
    (index, position) => position === 0 || index === indexes[position - 1] + 1
  )
  if (contiguous && days.length > 2)
    return `${dayLabels[days[0]]}–${dayLabels[days[days.length - 1]]}`
  return days.map((day) => dayLabels[day]).join(', ')
}
function formatWindow(window: PlaceBusinessHoursWindow) {
  return window.open === '00:00' && window.close === '00:00'
    ? 'Open 24 hours'
    : `${window.open}–${window.close}`
}
const hoursRows = computed(() =>
  props.place.business_hours.windows
    .map((window) => ({
      days: formatDays(window.days),
      time: formatWindow(window),
    }))
    .filter((row) => row.days)
)
const hasEditorialContent = computed(() =>
  Boolean(props.place.about || props.place.gallery_images.length)
)
const editTo = computed(
  () => `/places/${encodeURIComponent(props.place.id)}/edit`
)
</script>

<style scoped src="./detail.css"></style>
