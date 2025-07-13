<template>
  <div>
    <div v-if="loading">
      <p>Loading chef profile...</p>
    </div>

    <div v-else-if="chef">
      <h1>{{ chef.name || 'Chef Profile' }}</h1>
      <!-- Chef profile component will go here -->
      <div class="p-6 border rounded-lg">
        <h3 class="font-semibold mb-2">Chef Profile</h3>
        <p class="text-gray-600">
          Individual chef profile view will be implemented here.
        </p>
      </div>
    </div>

    <div v-else>
      <h1>Chef Not Found</h1>
      <p>The chef profile you're looking for doesn't exist.</p>
    </div>
  </div>
</template>

<script setup>
// Get the chef ID from the route
const route = useRoute()
const chefId = route.params.id

// State
const chef = ref(null)
const loading = ref(true)

// Simulate loading for now
setTimeout(() => {
  loading.value = false
  // Future: Fetch chef data
  // const { fetchChef } = useChefs()
  // chef.value = await fetchChef(chefId)
}, 1000)

// Set page meta
definePageMeta({
  title: 'Chef Profile',
  description: 'View chef profile and details',
})
</script>
