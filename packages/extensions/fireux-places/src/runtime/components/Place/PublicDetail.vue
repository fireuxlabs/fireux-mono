<!-- Concurrent edit — 2026-07-21 14:52 CEST — Place provenance/privacy hardening: remove public self-claim controls until verified ownership proof exists. -->
<!-- Concurrent edit — 2026-07-22 12:58 CEST — Place detail deletion: expose the guarded developer/admin removal action. -->
<template>
  <UPage class="place-public">
    <UPageBody class="pagebody">
      <MoleculesStateCard
        v-if="outcome === 'pending' || outcome === 'idle'"
        entity="place"
        kind="document"
        loading
      />

      <MoleculesStateCard
        v-else-if="outcome === 'error'"
        entity="place"
        kind="document"
        state="error"
        title="Place unavailable"
        description="This place could not be loaded. Please try again."
      >
        <UButton
          label="Try again"
          icon="i-lucide-refresh-cw"
          color="neutral"
          variant="soft"
          size="sm"
          @click="refresh"
        />
      </MoleculesStateCard>

      <MoleculesStateCard
        v-else-if="!place"
        entity="place"
        kind="document"
        state="missing"
        title="Place not found"
        description="This place does not exist or is not available publicly."
      >
        <UButton
          label="Browse places"
          icon="i-lucide-arrow-left"
          to="/places"
          color="neutral"
          variant="soft"
          size="sm"
        />
      </MoleculesStateCard>

      <div v-else class="place-public__detail" :style="detailStyle">
        <nav class="place-public__toolbar" aria-label="Place directory">
          <UButton
            to="/places"
            label="All places"
            icon="i-lucide-arrow-left"
            color="neutral"
            variant="ghost"
            size="sm"
          />
          <UButton
            v-if="isAdmin"
            :to="editTo"
            label="Edit place"
            icon="i-lucide-pencil"
            color="neutral"
            variant="soft"
            size="sm"
          />
        </nav>

        <PublicEntityHero
          :title="place.name"
          eyebrow="Place"
          :cover-url="place.cover_image"
          cover-alt=""
          :image-url="place.image_url"
          image-alt=""
          image-fit="cover"
          :initials="initials"
          :description="place.brand_tagline"
          :location="place.short_address"
        >
          <template #badges>
            <UBadge color="neutral" variant="soft">
              {{ placeTypeLabel }}
            </UBadge>
            <UBadge
              v-if="place.verified"
              color="success"
              variant="soft"
              icon="i-lucide-badge-check"
            >
              Verified
            </UBadge>
          </template>

          <template v-if="primaryActions.length" #actions>
            <UButton
              v-for="action in primaryActions"
              :key="action.label"
              :to="action.to"
              :icon="action.icon"
              :target="action.target"
              :rel="action.rel"
              :aria-label="action.ariaLabel"
              :color="action.key === 'directions' ? 'primary' : 'neutral'"
              :variant="action.key === 'directions' ? 'solid' : 'soft'"
            >
              {{ action.label }}
            </UButton>
          </template>
        </PublicEntityHero>

        <div
          class="place-public__content"
          :class="{ 'place-public__content--utilities': !hasEditorialContent }"
        >
          <div v-if="hasEditorialContent" class="place-public__editorial">
            <section v-if="place.about" class="place-public__about">
              <div class="place-public__section-heading">
                <p class="fx-type-label">About</p>
                <h2 class="fx-type-section-title">
                  {{ place.short_name || place.name }}
                </h2>
              </div>
              <p class="place-public__story fx-type-body">{{ place.about }}</p>
            </section>

            <section
              v-if="place.gallery_images?.length"
              class="place-public__gallery-section"
              aria-labelledby="place-gallery-title"
            >
              <div class="place-public__section-heading">
                <p class="fx-type-label">Gallery</p>
                <h2 id="place-gallery-title" class="fx-type-section-title">
                  Inside {{ place.short_name || place.name }}
                </h2>
              </div>
              <div class="place-public__gallery">
                <figure
                  v-for="(image, index) in place.gallery_images"
                  :key="image"
                >
                  <div class="place-public__media-fallback" aria-hidden="true">
                    <UIcon name="i-lucide-image" />
                  </div>
                  <img
                    :src="image"
                    :alt="`${place.name} gallery image ${index + 1}`"
                    loading="lazy"
                    decoding="async"
                    @error="hideFailedImage"
                  >
                </figure>
              </div>
            </section>
          </div>

          <aside class="place-public__utilities" aria-label="Place information">
            <UCard
              v-if="hasVisitDetails || hoursRows.length || facts.length"
              class="place-public__utility-card place-public__info-panel"
            >
              <div class="place-public__info-grid">
                <section
                  v-if="hasVisitDetails"
                  class="place-public__info-section"
                >
                  <div class="place-public__utility-heading">
                    <span>
                      <UIcon name="i-lucide-map-pin" aria-hidden="true" />
                    </span>
                    <div>
                      <p class="fx-type-label">Visit</p>
                      <h2 class="fx-type-card-heading">Find this place</h2>
                    </div>
                  </div>

                  <div class="place-public__visit">
                    <p v-if="place.short_address">{{ place.short_address }}</p>
                    <a
                      v-if="place.website"
                      :href="place.website"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {{ websiteLabel }}
                      <UIcon name="i-lucide-external-link" aria-hidden="true" />
                    </a>
                  </div>

                  <div
                    v-if="!hoursRows.length && place.place_type === 'physical'"
                    class="place-public__provider-hours"
                  >
                    <p class="fx-type-label">Current provider details</p>
                    <PlaceGoogleHours
                      :place-id="place.id"
                      button-label="Check Google hours"
                    />
                  </div>
                </section>

                <section
                  v-if="hoursRows.length"
                  class="place-public__info-section"
                >
                  <div class="place-public__utility-heading">
                    <span>
                      <UIcon name="i-lucide-clock-3" aria-hidden="true" />
                    </span>
                    <div>
                      <p class="fx-type-label">Opening hours</p>
                      <h2 class="fx-type-card-heading">When to visit</h2>
                    </div>
                  </div>

                  <dl class="place-public__hours">
                    <div
                      v-for="row in hoursRows"
                      :key="`${row.days}-${row.time}`"
                    >
                      <dt>{{ row.days }}</dt>
                      <dd>{{ row.time }}</dd>
                    </div>
                  </dl>
                  <p v-if="place.timezone" class="place-public__timezone-note">
                    Times shown in {{ place.timezone }}.
                  </p>
                </section>

                <section
                  v-if="facts.length"
                  class="place-public__info-section"
                >
                  <div class="place-public__utility-heading">
                    <span>
                      <UIcon name="i-lucide-landmark" aria-hidden="true" />
                    </span>
                    <div>
                      <p class="fx-type-label">Venue facts</p>
                      <h2 class="fx-type-card-heading">At a glance</h2>
                    </div>
                  </div>

                  <dl class="place-public__facts">
                    <div v-for="fact in facts" :key="fact.label">
                      <dt>{{ fact.label }}</dt>
                      <dd>{{ fact.value }}</dd>
                    </div>
                  </dl>
                </section>
              </div>
            </UCard>
          </aside>
        </div>

        <component
          :is="relatedOperationsComponent"
          v-if="relatedOperationsComponent"
          :place-id="place.id"
          :place-name="place.name"
        />

        <PlaceDelete :place="place" />

        <DevJson
          v-if="showDebug"
          title="Place (Public Projection)"
          context="Place detail page · places/[id] · bounded public projection"
          :data="place"
          :default-open="false"
        />
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { setResponseStatus } from '#imports'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { computed, resolveComponent } from 'vue'
import {
  usePlaceFetch,
  usePlaceSeo,
} from '../../composables/fireux/firestore/place/usePlace'
import type {
  PlaceBusinessHoursDay,
  PlaceBusinessHoursWindow,
} from '../../models/place.model'

const props = defineProps<{
  locator: string
}>()

const locator = computed(() => String(props.locator || '').trim())
const {
  place,
  outcome,
  statusCode,
  missing,
  failed,
  refresh,
  ready,
} = usePlaceFetch(locator)

await ready
if (import.meta.server && missing.value) {
  setResponseStatus(404)
} else if (import.meta.server && failed.value) {
  setResponseStatus(statusCode.value >= 400 ? statusCode.value : 503)
}

const { isAdmin } = useUser()
const showDebug = import.meta.dev
const resolvedRelatedOperations = resolveComponent(
  'KitchenPlacePublicOperations',
  false
)
const relatedOperationsComponent =
  typeof resolvedRelatedOperations === 'string'
    ? null
    : resolvedRelatedOperations
const initials = computed(() =>
  String(place.value?.name || 'P')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('')
)
const detailStyle = computed(() => {
  const palette = place.value?.brand_palette
  return {
    '--fx-public-entity-accent':
      palette?.primary_color || 'var(--ui-primary)',
  }
})
const placeTypeLabel = computed(() =>
  place.value?.place_type === 'non_physical'
    ? 'Non-physical place'
    : 'Physical place'
)
const mapUrl = computed(() => {
  if (place.value?.google_maps_url) return place.value.google_maps_url
  const address = String(place.value?.short_address || '').trim()
  if (!address || !place.value?.name) return ''
  const query = encodeURIComponent(`${place.value.name}, ${address}`)
  return `https://www.google.com/maps/search/?api=1&query=${query}`
})
const primaryActions = computed(() => [
  mapUrl.value
    ? {
        key: 'directions',
        label: 'Directions',
        ariaLabel: `Get directions to ${place.value?.name || 'this place'}`,
        icon: 'i-lucide-navigation',
        to: mapUrl.value,
        target: '_blank' as const,
        rel: 'noopener noreferrer',
      }
    : null,
  place.value?.website
    ? {
        key: 'website',
        label: 'Website',
        ariaLabel: `Visit the ${place.value.name} website`,
        icon: 'i-lucide-external-link',
        to: place.value.website,
        target: '_blank' as const,
        rel: 'noopener noreferrer',
      }
    : null,
].filter(Boolean) as Array<{
  key: 'directions' | 'website'
  label: string
  ariaLabel: string
  icon: string
  to: string
  target: '_blank'
  rel: string
}>)
const websiteLabel = computed(() => {
  const value = String(place.value?.website || '').trim()
  if (!value) return ''
  try {
    return new URL(value).hostname.replace(/^www\./, '')
  } catch {
    return value
  }
})
const hasVisitDetails = computed(() =>
  Boolean(
    place.value?.short_address ||
    place.value?.website ||
    (!place.value?.business_hours?.windows?.length &&
      place.value?.place_type === 'physical')
  )
)
const facts = computed(() => [
  place.value?.short_name &&
    place.value.short_name.localeCompare(place.value.name, undefined, {
      sensitivity: 'base',
    }) !== 0
    ? { label: 'Also known as', value: place.value.short_name }
    : null,
  place.value?.default_currency_code
    ? { label: 'Currency', value: place.value.default_currency_code }
    : null,
  place.value?.timezone
    ? { label: 'Time zone', value: place.value.timezone }
    : null,
].filter(Boolean) as Array<{ label: string; value: string }>)

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
  const days = orderedDays.filter(day => value.includes(day))
  if (days.length === orderedDays.length) return 'Every day'
  if (!days.length) return ''
  const indexes = days.map(day => orderedDays.indexOf(day))
  const contiguous = indexes.every(
    (index, position) => position === 0 || index === indexes[position - 1] + 1
  )
  if (contiguous && days.length > 2) {
    return `${dayLabels[days[0]]}–${dayLabels[days[days.length - 1]]}`
  }
  return days.map(day => dayLabels[day]).join(', ')
}

function formatWindow(window: PlaceBusinessHoursWindow) {
  return window.open === '00:00' && window.close === '00:00'
    ? 'Open 24 hours'
    : `${window.open}–${window.close}`
}

const hoursRows = computed(() =>
  (place.value?.business_hours?.windows || []).map(window => ({
    days: formatDays(window.days),
    time: formatWindow(window),
  })).filter(row => row.days)
)
const hasEditorialContent = computed(() =>
  Boolean(place.value?.about || place.value?.gallery_images?.length)
)
const editTo = computed(() =>
  locator.value
    ? `/places/${encodeURIComponent(locator.value)}/edit`
    : '/places'
)

function hideFailedImage(event: Event) {
  const image = event.currentTarget as HTMLImageElement | null
  if (image) image.hidden = true
}

usePlaceSeo(place)
</script>

<style scoped>
.place-public__detail {
  display: grid;
  gap: clamp(calc(var(--spacing) * 8), 5vw, calc(var(--spacing) * 14));
  padding-bottom: clamp(calc(var(--spacing) * 8), 6vw, calc(var(--spacing) * 20));
}

.place-public__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--spacing) * 3);
  margin-bottom: calc(var(--spacing) * -4);
}

.place-public__content {
  display: grid;
  gap: clamp(calc(var(--spacing) * 8), 5vw, calc(var(--spacing) * 12));
}

.place-public__editorial,
.place-public__utilities {
  display: grid;
  gap: calc(var(--spacing) * 6);
}

.place-public__section-heading {
  display: grid;
  gap: calc(var(--spacing) * 2);
  margin-bottom: calc(var(--spacing) * 5);
}

.place-public__about {
  display: grid;
  gap: calc(var(--spacing) * 5);
  padding-top: clamp(calc(var(--spacing) * 6), 5vw, calc(var(--spacing) * 10));
  border-top: 1px solid var(--ui-border);
}

.place-public__about .place-public__section-heading {
  margin-bottom: 0;
}

.place-public__section-heading .fx-type-label,
.place-public__utility-heading .fx-type-label {
  color: var(--ui-primary);
}

.place-public__story {
  max-width: 65ch;
  color: var(--ui-text-toned);
  font-size: clamp(var(--text-base), 1.6vw, var(--text-xl));
  line-height: var(--leading-relaxed);
  white-space: pre-line;
}

.place-public__gallery-section {
  display: grid;
  gap: calc(var(--spacing) * 2);
}

.place-public__gallery {
  display: grid;
  grid-auto-columns: min(82vw, calc(var(--spacing) * 72));
  grid-auto-flow: column;
  gap: calc(var(--spacing) * 3);
  overflow-x: auto;
  overscroll-behavior-inline: contain;
  padding-bottom: calc(var(--spacing) * 2);
  scroll-snap-type: inline mandatory;
  scrollbar-width: thin;
}

.place-public__gallery figure {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  margin: 0;
  border: 1px solid
    color-mix(in srgb, var(--ui-primary) 14%, var(--ui-border));
  border-radius: calc(var(--ui-radius) * 4);
  background: var(--ui-bg-accented);
  scroll-snap-align: start;
}

.place-public__gallery img {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.place-public__media-fallback {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: var(--ui-text-dimmed);
}

.place-public__media-fallback svg {
  width: calc(var(--spacing) * 8);
  height: calc(var(--spacing) * 8);
}

.place-public__utility-card {
  border-color: color-mix(in srgb, var(--ui-primary) 16%, var(--ui-border));
  border-radius: calc(var(--ui-radius) * 4);
  background: var(--ui-bg-elevated);
}

.place-public__info-grid {
  display: grid;
}

.place-public__info-section {
  display: grid;
  gap: calc(var(--spacing) * 5);
}

.place-public__info-section + .place-public__info-section {
  margin-top: calc(var(--spacing) * 6);
  padding-top: calc(var(--spacing) * 6);
  border-top: 1px solid
    color-mix(in srgb, var(--ui-primary) 14%, var(--ui-border));
}

.place-public__utility-heading {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) * 3);
}

.place-public__utility-heading > span {
  display: grid;
  width: calc(var(--spacing) * 10);
  height: calc(var(--spacing) * 10);
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid
    color-mix(in srgb, var(--ui-primary) 22%, var(--ui-border));
  border-radius: 9999px;
  background: color-mix(in srgb, var(--ui-primary) 8%, var(--ui-bg));
  color: var(--ui-primary);
}

.place-public__visit {
  display: grid;
  gap: calc(var(--spacing) * 3);
  color: var(--ui-text-muted);
  font-size: var(--text-sm);
}

.place-public__visit a {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  gap: calc(var(--spacing) * 2);
  color: var(--ui-text-highlighted);
  font-weight: var(--font-weight-medium);
}

.place-public__visit a:focus-visible {
  border-radius: var(--ui-radius);
  outline: 2px solid var(--ui-primary);
  outline-offset: calc(var(--spacing) * 1);
}

.place-public__provider-hours {
  display: grid;
  gap: calc(var(--spacing) * 3);
  margin-top: calc(var(--spacing) * 5);
  padding-top: calc(var(--spacing) * 5);
  border-top: 1px solid var(--ui-border);
}

.place-public__facts,
.place-public__hours {
  display: grid;
  gap: calc(var(--spacing) * 3);
}

.place-public__facts > div,
.place-public__hours > div {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: baseline;
  gap: calc(var(--spacing) * 4);
}

.place-public__facts dt,
.place-public__hours dt {
  color: var(--ui-text-muted);
  font-size: var(--text-sm);
}

.place-public__facts dd,
.place-public__hours dd {
  margin: 0;
  color: var(--ui-text-highlighted);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  text-align: end;
}

.place-public__timezone-note {
  margin-top: calc(var(--spacing) * 4);
  color: var(--ui-text-dimmed);
  font-size: var(--text-xs);
}

@media (min-width: 40rem) {
  .place-public__about {
    grid-template-columns:
      minmax(calc(var(--spacing) * 40), 2fr)
      minmax(0, 3fr);
    align-items: start;
  }

  .place-public__gallery {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-auto-columns: auto;
    grid-auto-flow: row;
    overflow: visible;
    padding-bottom: 0;
    scroll-snap-type: none;
  }

  .place-public__gallery figure:first-child:nth-last-child(n + 3) {
    grid-row: span 2;
    aspect-ratio: auto;
  }
}

@media (min-width: 64rem) {
  .place-public__content:not(.place-public__content--utilities) {
    grid-template-columns: minmax(0, 2fr) minmax(calc(var(--spacing) * 72), 1fr);
    align-items: start;
  }

  .place-public__content:not(.place-public__content--utilities)
    .place-public__utilities {
    position: sticky;
    top: calc(var(--spacing) * 24);
  }

  .place-public__content--utilities .place-public__info-grid {
    grid-template-columns: repeat(
      auto-fit,
      minmax(min(100%, calc(var(--spacing) * 60)), 1fr)
    );
  }

  .place-public__content--utilities
    .place-public__info-section
    + .place-public__info-section {
    margin-top: 0;
    margin-left: calc(var(--spacing) * 6);
    padding-top: 0;
    padding-left: calc(var(--spacing) * 6);
    border-top: 0;
    border-left: 1px solid
      color-mix(in srgb, var(--ui-primary) 14%, var(--ui-border));
  }
}
</style>
