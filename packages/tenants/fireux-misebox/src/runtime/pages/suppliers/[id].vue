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
import { useProfile } from 'fireux-core/src/runtime/composables/firestore/profiles/useProfile'
import { SUPPLIER_CONFIG } from '../../models/profiles/Supplier.model'

const route = useRoute()
const supplierId = route.params.id as string

// Define static page meta first (no reactive data allowed)
definePageMeta({
  title: 'Supplier Profile',
  description: 'View supplier profile',
})

// Use our unified profile composable
const { fetchById } = await useProfile(SUPPLIER_CONFIG)

// Fetch the supplier data using our composable
const {
  data: supplier,
  pending,
  error,
} = await useAsyncData(`supplier-${supplierId}`, () => fetchById(supplierId))

// Update head dynamically when supplier data loads
useHead({
  title: computed(() =>
    supplier.value?.company_name
      ? `${supplier.value.company_name} - Supplier Profile`
      : 'Supplier Profile'
  ),
  meta: [
    {
      name: 'description',
      content: computed(
        () => supplier.value?.bio_short || 'View supplier profile'
      ),
    },
  ],
})
</script>
