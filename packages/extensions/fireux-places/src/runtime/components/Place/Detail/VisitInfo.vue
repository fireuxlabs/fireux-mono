<template>
  <aside
    v-if="hasContent"
    class="place-visit-info"
    aria-label="Place information"
  >
    <section v-if="hasVisitDetails" class="place-visit-info__section">
      <h2 class="fx-type-card-heading">Find this place</h2>
      <div class="place-visit-info__location">
        <UIcon name="i-lucide-map-pin" aria-hidden="true" />
        <div>
          <p v-if="place.short_address">{{ place.short_address }}</p>
          <span>Coarse public location</span>
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
        class="place-visit-info__directions"
      />
      <div v-if="place.website" class="place-visit-info__website">
        <span>Website</span>
        <a :href="place.website" target="_blank" rel="noopener noreferrer">
          {{ websiteLabel }}
          <UIcon name="i-lucide-external-link" aria-hidden="true" />
        </a>
      </div>
    </section>

    <section v-if="hours.length" class="place-visit-info__section">
      <h2 class="fx-type-card-heading">Opening hours</h2>
      <dl class="place-visit-info__list place-visit-info__hours">
        <div v-for="row in hours" :key="`${row.days}-${row.time}`">
          <dt>{{ row.days }}</dt>
          <dd>{{ row.time }}</dd>
        </div>
      </dl>
    </section>

    <section
      v-else-if="place.place_type === 'physical'"
      class="place-visit-info__section"
    >
      <h2 class="fx-type-card-heading">Opening hours</h2>
      <div class="place-visit-info__provider-hours">
        <p>Hours not available</p>
        <span>Check Google for the latest opening hours.</span>
        <PlaceGoogleHours
          :place-id="place.id"
          button-label="Check Google hours"
        />
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
import type { PublicPlaceDetailProjection } from '../../../models/place-public.model'

defineOptions({ name: 'PlaceDetailVisitInfo' })

const props = defineProps<{
  place: PublicPlaceDetailProjection
  websiteLabel: string
  hasVisitDetails: boolean
  facts: Array<{ label: string; value: string }>
  hours: Array<{ days: string; time: string }>
}>()

const hasContent = computed(
  () => props.hasVisitDetails || props.hours.length || props.facts.length
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
  background: var(--ui-bg-elevated);
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 3);
  box-shadow: var(--shadow-sm);
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
  padding: calc(var(--spacing) * 4);
}
.place-visit-info__section + .place-visit-info__section {
  border-top: 1px solid var(--ui-border);
}
.place-visit-info__location {
  align-items: flex-start;
  display: flex;
  gap: calc(var(--spacing) * 3);
}
.place-visit-info__location > svg {
  color: var(--ui-primary);
  flex: 0 0 auto;
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
.place-visit-info__directions {
  color: white;
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
