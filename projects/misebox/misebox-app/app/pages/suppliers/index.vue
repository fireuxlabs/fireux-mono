<template>
  <div class="profile-page">
    <div class="profile-page-header">
      <h1 class="profile-page-title">Browse Suppliers</h1>
      <p class="profile-page-description">
        Connect with quality suppliers for your culinary business needs.
      </p>
    </div>

    <div class="profile-page-content">
      <OrganismsProfilesSupplierList
        :suppliers="suppliers"
        :loading="loading"
      />
    </div>
  </div>
</template>

<script setup>
import { useProfile } from '../../../../../../packages/fireux-core/src/runtime/composables/firestore/profiles/useProfile'
import { supplierConfig } from '../../../config/profiles/supplier.config'

// Set page meta
definePageMeta({
  title: 'Browse Suppliers',
  description: 'Find reliable suppliers for your restaurant needs',
})

// Use the profile composable to fetch suppliers
const { all: suppliers, loading } = await useProfile(supplierConfig)
</script>

<style scoped>
/* Styles are now in shared _profiles.scss */
</style>
