<template>
  <div class="profile-page">
    <div class="profile-page-header">
      <h1 class="profile-page-title">Browse Suppliers</h1>
      <p class="profile-page-description">
        Connect with quality suppliers for your culinary business needs.
      </p>
    </div>

    <div class="profile-page-content">
      <MiseSupplierList :suppliers="suppliers" :loading="loading" />
    </div>
  </div>
</template>

<script setup>
import { supplierConfig } from '../../models/profiles/Supplier.model'

// Set page meta
definePageMeta({
  title: 'Browse Suppliers',
  description: 'Find reliable suppliers for your restaurant needs',
})

// Use the profile composable to fetch suppliers
const { all: suppliers, loading } = await useProfile(supplierConfig)
</script>

<style scoped>
.profile-page {
  padding: 2rem 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.profile-page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.profile-page-title {
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 1rem;
}

.profile-page-description {
  font-size: 1.125rem;
  color: #6b7280;
  max-width: 32rem;
  margin: 0 auto;
}

.profile-page-content {
  margin-top: 2rem;
}
</style>
