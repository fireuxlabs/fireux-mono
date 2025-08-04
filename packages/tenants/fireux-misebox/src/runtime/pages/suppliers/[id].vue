<template>
  <div>
    <div v-if="pending">
      <div class="loading-state">
        <h1>Loading supplier profile...</h1>
      </div>
    </div>
    <div v-else-if="supplier">
      <MiseSupplierProfile :supplier="supplier" />
    </div>
    <div v-else>
      <div class="error-state">
        <h1>Supplier Not Found</h1>
        <p>The supplier profile you're looking for doesn't exist.</p>
        <NuxtLink to="/suppliers" class="back-link">
          ← Back to Suppliers
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
// Get the supplier ID from the route
const route = useRoute()
const supplierId = route.params.id

// Fetch supplier data using composable
const { data: supplier, pending } = await useFetch(
  `/api/suppliers/${supplierId}`
)

// Set page meta
definePageMeta({
  title: 'Supplier Profile',
})
</script>

