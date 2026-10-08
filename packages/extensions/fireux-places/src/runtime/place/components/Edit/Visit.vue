<template>
  <!-- Concurrent edit — 2026-07-20 21:17 CEST — Place-root authority pass: route manual edits through authorized sparse Place mutations. -->
  <UCard v-if="hasPlace">
    <template #header>
      <div>
        <div class="text-base font-semibold text-highlighted">Location</div>
      </div>
    </template>

    <div class="grid gap-4 md:grid-cols-2">
      <div style="grid-column: 1 / -1">
        <PlaceEditLocation
          v-if="place"
          :key="place.id"
          :place="place"
          :mutation-authority="mutationAuthority"
        />
      </div>
      <MoleculesFormsEditableSimpleField
        label="Timezone"
        :value="place?.timezone"
        placeholder="Europe/Zurich"
        :maxlength="80"
        :update="handleTimezone"
      />
      <MoleculesFormsEditableSimpleField
        v-if="showCurrency"
        label="Currency"
        :value="place?.default_currency_code"
        placeholder="CHF"
        :maxlength="3"
        :update="handleCurrency"
      />
      <slot name="settings" />
    </div>
    <MoleculesDisclosurePanel title="Map coordinates and search" class="mt-4">
      <div class="grid gap-4 md:grid-cols-2">
        <MoleculesFormsEditableSimpleField
          label="Search term"
          :value="place?.search_term"
          placeholder="yellow velo postgasse 11, 3800 interlaken, switzerland"
          :maxlength="240"
          :update="handleManualSearchTerm"
        />
        <MoleculesFormsEditableSimpleField
          label="Latitude"
          type="number"
          :value="place?.lat"
          placeholder="46.6868497"
          :update="handleManualLat"
        />
        <MoleculesFormsEditableSimpleField
          label="Longitude"
          type="number"
          :value="place?.lng"
          placeholder="7.8542379"
          :update="handleManualLng"
        />
      </div>
    </MoleculesDisclosurePanel>
  </UCard>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { computed } from 'vue'
import {
  type PlaceMutationAuthority,
  usePlaceUpdate,
} from '../../composables/firestore/mutations/usePlaceUpdate'
import type { Place } from '../../models/place.model.ts'

const props = withDefaults(
  defineProps<{
    place: Place | null
    showCurrency?: boolean
    mutationAuthority?: PlaceMutationAuthority | null
  }>(),
  { showCurrency: true }
)
const place = computed(() => props.place)
const placeId = computed(() => place.value?.id ?? '')
const hasPlace = computed(() => Boolean(place.value))
const toast = useToastify()
const {
  updateLat,
  updateLng,
  updateTimezone,
  updateDefaultCurrencyCode,
  updateSearchTerm,
} = usePlaceUpdate({ authority: () => props.mutationAuthority })

async function updatePlace(
  action: () => Promise<void>,
  successTitle: string,
  failTitle: string
) {
  if (!placeId.value) return
  try {
    await action()
    toast.success(successTitle)
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`${failTitle}: ${msg}`)
    throw error
  }
}

async function handleTimezone(value: string) {
  await updatePlace(
    () => updateTimezone(value, { id: placeId.value }),
    'Timezone updated',
    'Failed to update timezone'
  )
}
async function handleCurrency(value: string) {
  await updatePlace(
    () => updateDefaultCurrencyCode(value, { id: placeId.value }),
    'Currency updated',
    'Failed to update currency'
  )
}

async function handleManualSearchTerm(value: string) {
  await updatePlace(
    () => updateSearchTerm(value, { id: placeId.value }),
    'Search term updated',
    'Failed to update search term'
  )
}

async function handleManualLat(value: string | number) {
  await updatePlace(
    () => updateLat(value, { id: placeId.value }),
    'Latitude updated',
    'Failed to update latitude'
  )
}

async function handleManualLng(value: string | number) {
  await updatePlace(
    () => updateLng(value, { id: placeId.value }),
    'Longitude updated',
    'Failed to update longitude'
  )
}
</script>
