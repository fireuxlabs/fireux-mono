<template>
  <div>
    <div v-if="loading">
      <p>Loading supplier profile...</p>
    </div>

    <div v-else-if="supplier">
      <h1>{{ supplier.business_name || 'Supplier Profile' }}</h1>
      <!-- Supplier profile component will go here -->
      <div class="p-6 border rounded-lg">
        <h3 class="font-semibold mb-2">Supplier Profile</h3>
        <p class="text-gray-600">
          Individual supplier profile view will be implemented here.
        </p>
      </div>
    </div>

    <div v-else>
      <h1>Supplier Not Found</h1>
      <p>The supplier profile you're looking for doesn't exist.</p>
    </div>
  </div>
</template>

<script setup>
// Get the supplier ID from the route
const route = useRoute()
const supplierId = route.params.id

// State
const supplier = ref(null)
const loading = ref(true)

// Simulate loading for now
setTimeout(() => {
  loading.value = false
  // Future: Fetch supplier data
  // const { fetchSupplier } = useSuppliers()
  // supplier.value = await fetchSupplier(supplierId)
}, 1000)

// Set page meta
definePageMeta({
  title: 'Supplier Profile',
  description: 'View supplier profile and details',
})
</script>
