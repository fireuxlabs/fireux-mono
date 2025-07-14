<template>
  <div>
    <div v-if="!supplier">
      <h1>Loading supplier profile...</h1>
    </div>
    <div v-else-if="supplier">
      <OrganismsProfilesSupplierProfile :supplier="supplier" />
    </div>
    <div v-else>
      <h1>Supplier Not Found</h1>
      <p>The supplier profile you're looking for doesn't exist.</p>
      <NuxtLink to="/suppliers" class="back-link">
        ← Back to Suppliers
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { useProfile } from '../../../../../../packages/fireux-core/src/runtime/composables/firestore/profiles/useProfile'
import { supplierConfig } from '../../../config/profiles/supplier.config'

// Get the supplier ID from the route
const route = useRoute()
const supplierId = route.params.id

const { fetchSupplier } = await useProfile(supplierConfig)

// fetchSupplier returns a ref, so we can use it directly
const supplier = await fetchSupplier(String(supplierId))

// Set page meta
definePageMeta({
  title: 'Supplier Profile',
})
</script>
