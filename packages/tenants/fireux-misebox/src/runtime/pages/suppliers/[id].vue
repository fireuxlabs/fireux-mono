<template>
  <ClientOnly>
    <div>
      <div v-if="supplier">
        <MiseSupplierProfile :supplier="supplier" />

        <!-- Edit Profile Button (shown when viewing own profile) -->
        <div v-if="appUser?.uid === supplier.uid" class="edit-profile-section">
          <UButton
            @click="navigateToEdit"
            icon="i-lucide-pencil"
            size="md"
            color="primary"
            variant="solid"
            class="edit-profile-button"
          >
            Edit Profile
          </UButton>
        </div>
      </div>
      <div v-else class="error-state">
        <h1>Supplier Not Found</h1>
        <p>The supplier profile you're looking for doesn't exist.</p>
        <NuxtLink to="/suppliers" class="back-link"
          >← Back to Suppliers</NuxtLink
        >
      </div>
    </div>

    <template #fallback>
      <div class="loading-state">
        <h1>Loading supplier profile...</h1>
      </div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { supplierConfig } from '../../models/profiles/Supplier.model'

const route = useRoute()
const supplierId = route.params.id as string

// Define static page meta first (no reactive data allowed)
definePageMeta({
  title: 'Supplier Profile',
  description: 'View supplier profile',
})

// Get current user for edit permission check
const { appUser } = await useAppUser()

// Use our unified profile composable
const { fetchById } = await useProfile(supplierConfig)

// Fetch supplier data
const supplier = await fetchById(supplierId)

// Navigation function for edit profile
const navigateToEdit = () => {
  navigateTo('/dashboard/supplier-profile')
}

// Update head dynamically when supplier data loads
useHead({
  title: computed(() =>
    supplier?.company_name
      ? `${supplier.company_name} - Supplier Profile`
      : 'Supplier Profile'
  ),
  meta: [
    {
      name: 'description',
      content: computed(() => supplier?.bio_short || 'View supplier profile'),
    },
  ],
})
</script>
