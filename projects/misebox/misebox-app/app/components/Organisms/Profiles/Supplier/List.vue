<template>
  <div v-if="loading">
    <p>Loading suppliers...</p>
  </div>

  <div v-else-if="suppliers?.length" class="profile-list">
    <OrganismsProfilesSupplierCardsCell
      v-for="supplier in suppliers"
      :key="supplier.id"
      :supplier="supplier"
    />
  </div>

  <div v-else>
    <h3>No suppliers found</h3>
    <p>There are currently no suppliers to display.</p>
  </div>
</template>

<script setup>
const props = defineProps({
  suppliers: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})
</script>
