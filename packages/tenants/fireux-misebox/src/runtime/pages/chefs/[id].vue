<template>
  <div>
    <div v-if="pending">
      <div class="loading-state">
        <h1>Loading chef profile...</h1>
      </div>
    </div>
    <div v-else-if="chef">
      <MiseChefProfile :chef="chef" />
    </div>
    <div v-else>
      <div class="error-state">
        <h1>Chef Not Found</h1>
        <p>The chef profile you're looking for doesn't exist.</p>
        <NuxtLink to="/chefs" class="back-link"> ← Back to Chefs </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
// Get the chef ID from the route
const route = useRoute()
const chefId = route.params.id

// Fetch chef data using composable
const { data: chef, pending } = await useFetch(`/api/chefs/${chefId}`)

// Set page meta
definePageMeta({
  title: 'Chef Profile',
})
</script>

<style scoped>
.loading-state,
.error-state {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  text-align: center;
}
</style>
