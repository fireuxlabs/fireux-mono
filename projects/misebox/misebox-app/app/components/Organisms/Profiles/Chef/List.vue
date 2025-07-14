<template>
  <div v-if="loading">
    <p>Loading chefs...</p>
  </div>
  <div v-else-if="chefs?.length" class="profile-list">
    <OrganismsProfilesChefCardsCell
      v-for="chef in chefs"
      :key="chef.id"
      :chef="chef"
    />
  </div>

  <div v-else>
    <h3>No chefs found</h3>
    <p>There are currently no chefs to display.</p>
  </div>
</template>

<script setup>
const props = defineProps({
  chefs: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})
</script>
