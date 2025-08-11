<template>
  <div>
    <div v-if="pending" class="loading-state">
      <h1>Loading your supplier profile...</h1>
    </div>
    <div v-else-if="!appUser" class="error-state">
      <h1>Authentication Required</h1>
      <p>Please log in to edit your supplier profile.</p>
      <NuxtLink to="/auth" class="back-link">← Go to Login</NuxtLink>
    </div>
    <ClientOnly v-else-if="supplier">
      <MiseProfilesSupplierEdit :supplier="supplier" />
      <template #fallback>
        <div class="loading-state">
          <h1>Loading supplier editor...</h1>
        </div>
      </template>
    </ClientOnly>
    <div v-else class="error-state">
      <h1>Supplier Profile Not Found</h1>
      <p>You don't have a supplier profile yet. Would you like to create one?</p>
      <NuxtLink to="/suppliers" class="back-link">← Browse Suppliers</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { supplierConfig } from '../../models/profiles/Supplier.model'

// Define static page meta first
definePageMeta({
  title: 'Edit Supplier Profile',
  description: 'Edit your supplier profile information',
})

// Get current user for authentication
const { appUser } = await useAppUser()

// Use our unified profile composable
const { fetchById } = await useProfile(supplierConfig)

// Fetch the supplier data using current user's ID
const {
  data: supplier,
  pending,
  error,
} = await useAsyncData(
  `supplier-edit-${appUser.value?.uid}`,
  () => appUser.value?.uid ? fetchById(appUser.value.uid) : null,
  {
    watch: [appUser]
  }
)

// Navigation function to go back to profile view
const navigateToProfile = () => {
  if (supplier.value?.uid) {
    navigateTo(`/suppliers/${supplier.value.uid}`)
  }
}

// Update head dynamically when supplier data loads
useHead({
  title: computed(() =>
    supplier.value?.company_name
      ? `Edit ${supplier.value.company_name} Profile`
      : 'Edit Supplier Profile'
  ),
  meta: [
    {
      name: 'description',
      content: computed(() => 'Edit your supplier profile information and settings'),
    },
  ],
})
</script>
