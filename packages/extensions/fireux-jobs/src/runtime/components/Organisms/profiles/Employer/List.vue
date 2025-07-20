<template>
  <div v-if="loading">
    <p>Loading employers...</p>
  </div>

  <div v-else-if="employers?.length" class="profile-list">
    <FireOrganismsProfilesEmployerCardsCell
      v-for="employer in employers"
      :key="employer.id"
      :employer="employer"
    />
  </div>

  <div v-else>
    <h3>No employers found</h3>
    <p>There are currently no employers to display.</p>
  </div>
</template>

<script setup>
const props = defineProps({
  employers: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})
</script>
