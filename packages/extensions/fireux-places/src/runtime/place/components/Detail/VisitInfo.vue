<template>
  <aside
    v-if="hasContent"
    class="place-visit-info"
    aria-label="Venue information"
  >
    <section
      v-if="hours.length"
      id="opening-hours"
      class="place-visit-info__section scroll-mt-24"
    >
      <h2 class="fx-type-card-heading">Venue opening hours</h2>
      <dl class="place-visit-info__list place-visit-info__hours">
        <div v-for="row in hours" :key="`${row.days}-${row.time}`">
          <dt>{{ row.days }}</dt>
          <dd>{{ row.time }}</dd>
        </div>
      </dl>
    </section>

    <section
      v-else-if="place.place_type === 'physical'"
      id="opening-hours"
      class="place-visit-info__section"
    >
      <h2 class="fx-type-card-heading">Venue opening hours</h2>
      <div class="place-visit-info__provider-hours">
        <p>Hours not available</p>
        <span>Check Google for the latest opening hours.</span>
        <PlaceGoogleHours
          :place-id="place.id"
          button-label="Check Google hours"
        />
      </div>
    </section>

    <section v-if="hasVisitDetails" class="place-visit-info__section">
      <h2 class="fx-type-card-heading">Plan your visit</h2>
      <div class="place-visit-info__location">
        <UIcon name="i-lucide-map-pin" aria-hidden="true" />
        <div>
          <p v-if="place.formatted_address || place.short_address">
            {{ place.formatted_address || place.short_address }}
          </p>
        </div>
      </div>
      <UButton
        v-if="mapUrl"
        :to="mapUrl"
        label="Directions"
        icon="i-lucide-navigation"
        target="_blank"
        rel="noopener noreferrer"
        color="primary"
        size="sm"
      />
      <div v-if="place.website" class="place-visit-info__website">
        <span>Website</span>
        <a :href="place.website" target="_blank" rel="noopener noreferrer">
          {{ websiteLabel }}
          <UIcon name="i-lucide-external-link" aria-hidden="true" />
        </a>
      </div>
    </section>

    <section v-if="facts.length" class="place-visit-info__section">
      <h2 class="fx-type-card-heading">Venue facts</h2>
      <dl class="place-visit-info__list">
        <div v-for="fact in facts" :key="fact.label">
          <dt>{{ fact.label }}</dt>
          <dd>{{ fact.value }}</dd>
        </div>
      </dl>
    </section>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Place } from '../../models/place.model.ts'

defineOptions({ name: 'PlaceDetailVisitInfo' })

const props = defineProps<{
  place: Place
}>()

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
    props.place.formatted_address ||
      props.place.short_address ||
      props.place.website
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
const dayLabels = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
} as const
const hours = computed(() => {
  const windows = props.place.business_hours.windows
  if (!windows.length) return []
  return Object.entries(dayLabels).map(([day, label]) => ({
    days: label,
    time:
      windows
        .filter((window) => window.days.includes(day as keyof typeof dayLabels))
        .map((window) =>
          window.open === window.close
            ? 'Open 24 hours'
            : `${window.open}–${window.close}`
        )
        .join(', ') || 'Closed',
  }))
})

const hasContent = computed(
  () => hasVisitDetails.value || hours.value.length || facts.value.length
)
const mapUrl = computed(() => {
  if (props.place.google_maps_url) return props.place.google_maps_url
  if (!props.place.short_address) return ''
  const query = encodeURIComponent(
    `${props.place.name}, ${props.place.short_address}`
  )
  return `https://www.google.com/maps/search/?api=1&query=${query}`
})
</script>

<style scoped>
.place-visit-info {
  background: var(--ui-bg);
  border: 1px solid var(--ui-border);
  border-radius: 1.5rem;
  box-shadow: 0 8px 30px #00000005;
  display: grid;
  overflow: hidden;
}
.place-visit-info--wide {
  border: 0;
  border-radius: 0;
  box-shadow: none;
}
.place-visit-info__section {
  display: grid;
  align-content: start;
  gap: calc(var(--spacing) * 3);
  padding: 1.5rem;
}
.place-visit-info__section + .place-visit-info__section {
  border-top: 1px solid var(--ui-border);
}
.place-visit-info__location {
  align-items: flex-start;
  display: flex;
  gap: calc(var(--spacing) * 3);
}
.place-visit-info__location > :first-child {
  color: var(--ui-primary);
  flex: 0 0 1.1rem;
  width: 1.1rem;
  height: 1.1rem;
  margin-top: calc(var(--spacing) * 0.5);
}
.place-visit-info__location p {
  color: var(--ui-text-highlighted);
  font-size: var(--text-sm);
  margin: 0;
}
.place-visit-info__location span,
.place-visit-info__provider-hours span {
  color: var(--ui-text-dimmed);
  font-size: var(--text-xs);
}
.place-visit-info__website,
.place-visit-info__provider-hours {
  border-top: 1px solid var(--ui-border);
  display: grid;
  gap: calc(var(--spacing) * 2);
  padding-top: calc(var(--spacing) * 4);
}
.place-visit-info__website > span,
.place-visit-info__provider-hours > p {
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  margin: 0;
}
.place-visit-info__website a {
  align-items: center;
  color: var(--ui-text-highlighted);
  display: flex;
  font-size: var(--text-sm);
  gap: calc(var(--spacing) * 2);
}
.place-visit-info__list {
  display: grid;
  gap: calc(var(--spacing) * 3);
}
.place-visit-info__list > div {
  display: grid;
  gap: calc(var(--spacing) * 3);
  grid-template-columns: minmax(0, 1fr) auto;
}
.place-visit-info__list dt {
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
}
.place-visit-info__list dd {
  color: var(--ui-text-highlighted);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  margin: 0;
  text-align: end;
}
@media (min-width: 48rem) {
  .place-visit-info {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .place-visit-info__section + .place-visit-info__section {
    border-left: 1px solid var(--ui-border);
    border-top: 0;
  }
}
@media (min-width: 64rem) {
  .place-visit-info {
    grid-template-columns: minmax(0, 1fr);
  }
  .place-visit-info__section + .place-visit-info__section {
    border-left: 0;
    border-top: 1px solid var(--ui-border);
  }
  .place-visit-info--wide {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .place-visit-info--wide
    .place-visit-info__section
    + .place-visit-info__section {
    border-left: 1px solid var(--ui-border);
    border-top: 0;
  }
}
</style>
