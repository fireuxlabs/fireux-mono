<template>
  <div>
    <div v-if="pending" class="loading-state">
      <h1>Loading supplier profile...</h1>
    </div>
    <div v-else-if="supplier">
      <MiseSupplierProfile :supplier="supplier" />
    </div>
    <div v-else class="error-state">
      <h1>Supplier Not Found</h1>
      <p>The supplier profile you're looking for doesn't exist.</p>
      <NuxtLink to="/suppliers" class="back-link">← Back to Suppliers</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const supplierId = route.params.id

const { data: supplier, pending } = await useFetch(`/api/suppliers/${supplierId}`)

definePageMeta({
  title: computed(() => supplier.value?.company_name || 'Supplier Profile'),
  description: computed(() => supplier.value?.bio_short || 'View supplier profile')
})
</script>

