<!-- `packages/extensions/fireux-places/src/runtime/pages/places.vue` -->

<template>
  <UPage>
    <UPageHeader
      title="Places"
      description="Search for locations, inspect Google details, and review saved entries."
    />

    <UContainer class="py-8 space-y-8">
      <OrganismsPlacesSearchSection
        v-model="query"
        :suggestions="suggestions"
        :selected-place="selectedPlace"
        :selected-place-cell="selectedPlaceCell"
        @input="onInput"
        @select="selectSuggestion"
        @clear="clearSelection"
      />

      <OrganismsPlacesList
        :label="savedSectionLabel"
        :badge-count="savedBadgeCount"
        :loading="savedPlacesLoading"
        :cells="visibleSavedPlaceCells"
        :query="query"
        :query-has-min-length="queryHasMinLength"
        @select="selectSaved"
      />
    </UContainer>
  </UPage>
</template>

<script setup lang="ts">
import OrganismsPlacesSearchSection from '../components/organisms/places/Search/Section.vue'
import OrganismsPlacesList from '../components/organisms/places/List.vue'
import { usePlaces } from '../composables/usePlaces'

const {
  query,
  suggestions,
  selectedPlace,
  selectedPlaceCell,
  savedPlacesLoading,
  savedSectionLabel,
  savedBadgeCount,
  visibleSavedPlaceCells,
  queryHasMinLength,
  onInput,
  selectSuggestion,
  selectSaved,
  clearSelection,
} = usePlaces()
</script>
