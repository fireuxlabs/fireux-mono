<template>
  <section class="space-y-4">
    <UCard class="shadow-sm" :ui="{ body: 'space-y-4' }">
      <!-- Search input -->
      <OrganismsPlacesSearchBar v-model="query" />

      <!-- Selected place -->
      <pre v-if="selected">{{ selected }}</pre>

      <!-- Dropdown suggestions -->
      <OrganismsPlacesSearchDropdown
        v-else-if="results.length"
        :cells="results"
        @select="select"
      />
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { usePlacesSearch } from 'fireux-places/runtime/composables/usePlacesSearch.ts'

const { query, results, selected, select } = usePlacesSearch()
</script>