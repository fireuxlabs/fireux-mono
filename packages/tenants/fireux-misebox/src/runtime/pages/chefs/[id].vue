<template>
  <div>
    <div v-if="pending" class="loading-state">
      <h1>Loading chef profile...</h1>
    </div>
    <div v-else-if="chef">
      <MiseChefProfile :chef="chef" />
    </div>
    <div v-else class="error-state">
      <h1>Chef Not Found</h1>
      <p>The chef profile you're looking for doesn't exist.</p>
      <NuxtLink to="/chefs" class="back-link">← Back to Chefs</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const chefId = route.params.id

const { data: chef, pending } = await useFetch(`/api/chefs/${chefId}`)

definePageMeta({
  title: computed(() => chef.value?.chef_name || 'Chef Profile'),
  description: computed(() => chef.value?.bio_short || 'View chef profile'),
})
</script>
