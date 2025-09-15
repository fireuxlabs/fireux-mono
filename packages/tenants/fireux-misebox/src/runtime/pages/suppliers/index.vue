<template>
  <OrganismsProfileRoot :config="supplierConfig">
    <template #profile-pill="{ profile }">
      <div @click="navigateToSupplier(profile)" style="cursor: pointer">
        <OrganismsProfilesSupplierCardsPill :supplier="profile" />
      </div>
    </template>

    <template #profile-card="{ profile }">
      <div @click="navigateToSupplier(profile)" style="cursor: pointer">
        <OrganismsProfilesSupplierCardsProfile :supplier="profile" />
      </div>
    </template>

    <template #profile-item="{ profile }">
      <div @click="navigateToSupplier(profile)" style="cursor: pointer">
        <OrganismsProfilesSupplierCardsCell :supplier="profile" />
      </div>
    </template>
  </OrganismsProfileRoot>
</template>

<script setup>
import { supplierConfig } from '../../models/profiles/Supplier.model'

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
