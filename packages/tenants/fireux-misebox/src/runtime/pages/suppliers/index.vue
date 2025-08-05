<template>
  <FireOrganismsProfileRoot
    :config="supplierConfig"
    :filter-composable="useSupplierFilters"
  >
    <template #profile-card="{ profile }">
      <MiseSupplierCardsProfile :supplier="profile" />
    </template>

    <template #profile-item="{ profile }">
      <MiseSupplierCardsCell :supplier="profile" />
    </template>
  </FireOrganismsProfileRoot>
</template>

<script setup>
import { supplierConfig } from '../../models/profiles/Supplier.model'
import { useSupplierFilters } from '../../composables/profiles/useSupplierFilters'

// Set page meta
definePageMeta({
  title: 'Browse Suppliers',
  description: 'Find quality suppliers for your business needs',
})
</script>
