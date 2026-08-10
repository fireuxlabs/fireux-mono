<template>
  <UCard v-if="groups.length">
    <template #header>
      <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div class="text-base font-semibold text-highlighted">
            Place completeness
          </div>
          <p class="text-sm text-dimmed">
            Missing optional information does not block using this Place.
          </p>
        </div>
        <UBadge color="warning" variant="soft">
          {{ missingCount }} missing
        </UBadge>
      </div>
    </template>

    <div class="grid gap-5 lg:grid-cols-3">
      <section v-for="group in groups" :key="group.title" class="space-y-3">
        <div>
          <h3 class="text-sm font-semibold text-highlighted">
            {{ group.title }}
          </h3>
          <p class="text-xs text-dimmed">{{ group.description }}</p>
        </div>
        <ul class="flex flex-wrap gap-2" :aria-label="group.title">
          <li v-for="field in group.fields" :key="field">
            <UBadge color="neutral" variant="soft">{{ field }}</UBadge>
          </li>
        </ul>
      </section>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PlaceEditProjection } from '../../../models/place-edit.model'

const props = defineProps<{ place: PlaceEditProjection }>()
const present = (value: unknown) =>
  typeof value === 'string' ? Boolean(value.trim()) : Boolean(value)

const attention = computed(() => [
  !present(props.place.slug) ? 'Route slug (read-only)' : '',
  !present(props.place.short_address) ? 'Public location' : '',
  !present(props.place.default_currency_code) ? 'Currency' : '',
  !present(props.place.timezone) ? 'Time zone' : '',
  !present(props.place.brand_palette.primary_color) ? 'Primary colour' : '',
  !present(props.place.brand_palette.secondary_color) ? 'Secondary colour' : '',
].filter(Boolean))

const recommended = computed(() => [
  !present(props.place.short_name) ? 'Short name' : '',
  !present(props.place.brand_tagline) ? 'Brand tagline' : '',
  !present(props.place.about) ? 'About' : '',
  !present(props.place.assets.image) ? 'Place image' : '',
  !present(props.place.assets.cover) ? 'Cover image' : '',
  !props.place.assets.gallery.length ? 'Gallery' : '',
  !present(props.place.website) ? 'Website' : '',
  !props.place.business_hours.windows.length ? 'Opening hours' : '',
  props.place.source === 'manual' && !present(props.place.formatted_address)
    ? 'Full address'
    : '',
].filter(Boolean))

const optional = computed(() => [
  !present(props.place.phone) ? 'Phone' : '',
  !present(props.place.email) ? 'Email' : '',
  !Object.values(props.place.social_links).some(present) ? 'Social profiles' : '',
].filter(Boolean))

const groups = computed(() => [
  {
    title: 'Needs attention',
    description: 'Core public identity and operating defaults.',
    fields: attention.value,
  },
  {
    title: 'Recommended',
    description: 'Content that makes the public Place useful and recognisable.',
    fields: recommended.value,
  },
  {
    title: 'Optional',
    description: 'Owner contact and social presence.',
    fields: optional.value,
  },
].filter(group => group.fields.length))

const missingCount = computed(() =>
  groups.value.reduce((total, group) => total + group.fields.length, 0)
)
</script>
