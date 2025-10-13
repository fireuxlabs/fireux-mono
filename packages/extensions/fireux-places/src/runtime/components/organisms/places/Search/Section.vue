<template>
  <section class="space-y-4">
    <UCard class="shadow-sm" :ui="{ body: 'space-y-4' }">
      <!-- Search input -->
      <OrganismsPlacesSearchBar v-model="query" />

      <!-- Selected place -->
      <OrganismsPlacesSearchSelected
        v-if="selected"
        :place="selected"
        @clear="clear"
        @confirm="onConfirm"
      />

      <!-- Suggestions -->
      <OrganismsPlacesSearchDropdown
        v-else-if="results.length"
        :cells="results"
        @select="select"
      />

      <!-- Status messages -->
      <p v-if="isSearching" class="text-xs text-gray-500">Searching…</p>
      <p v-else-if="showEmpty" class="text-xs text-gray-500">
        No results yet—try another name.
      </p>
    </UCard>
  </section>
</template>

<script setup lang="ts">
/* eslint-disable no-console */
import { computed } from 'vue'
import { usePlacesSearch } from '../../../../composables/usePlacesSearch'
import type { BasePlace } from '../../../../models/place.model'

const { query, results, selected, isSearching, select, clear } =
  usePlacesSearch()

const showEmpty = computed(
  () =>
    !isSearching.value &&
    !selected.value &&
    query.value.trim().length > 0 &&
    results.value.length === 0
)

function onConfirm(place: BasePlace) {
  if (import.meta.dev) {
    console.log('[places][confirm]', place)
  }
}
</script>
