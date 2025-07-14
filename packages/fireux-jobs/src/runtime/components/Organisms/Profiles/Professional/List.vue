<template>
  <div v-if="loading">
    <p>Loading professionals...</p>
  </div>

  <div v-else-if="professionals?.length" class="profile-list">
    <FireOrganismsProfilesProfessionalCardsCell
      v-for="professional in professionals"
      :key="professional.id"
      :professional="professional"
    />
  </div>

  <div v-else>
    <h3>No professionals found</h3>
    <p>There are currently no professionals to display.</p>
  </div>
</template>

<script setup>
const props = defineProps({
  professionals: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})
</script>
