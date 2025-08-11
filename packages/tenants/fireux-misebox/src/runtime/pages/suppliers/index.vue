<template>
  <FireOrganismsProfileRoot
    :config="supplierConfig"
    :filter-composable="useSupplierFilters"
  >
    <template #profile-pill="{ profile }">
      <div @click="navigateToSupplier(profile)" style="cursor: pointer">
        <MiseProfilesSupplierCardsPill :supplier="profile" />
      </div>
    </template>

    <template #profile-card="{ profile }">
      <div @click="navigateToSupplier(profile)" style="cursor: pointer">
        <MiseProfilesSupplierCardsProfile :supplier="profile" />
      </div>
    </template>

    <template #profile-item="{ profile }">
      <div @click="navigateToSupplier(profile)" style="cursor: pointer">
        <MiseProfilesSupplierCardsCell :supplier="profile" />
      </div>
    </template>
  </FireOrganismsProfileRoot>
</template>

<script setup>
import { supplierConfig } from '../../models/profiles/Supplier.model'
import { useSupplierFilters } from '../../composables/profiles/useSupplierFilters'

// Navigation function
const navigateToSupplier = (supplier) => {
  if (supplier?.uid) {
    navigateTo(`/suppliers/${supplier.uid}`)
  }
}

// Set page meta
definePageMeta({
  title: 'Browse Suppliers',
  description: 'Find quality suppliers for your business needs',
})
</script>
