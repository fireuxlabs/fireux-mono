<template>
  <ClientOnly>
    <div>
      <div v-if="supplierData">
        <MiseSupplierProfile :supplier="supplierData" />

        <!-- Edit Profile Button (shown when viewing own profile) -->
  <div v-if="appUser?.id === supplierData.id" class="edit-profile-section">
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
import { computed } from 'vue'
import { useRoute, useHead, navigateTo, useSeoMeta } from 'nuxt/app'
import { useFirestoreRead } from 'fireux-core/runtime/composables/firestore/useFirestoreRead'
import { useUser } from 'fireux-core/runtime/composables/firestore/users/useUser'
import { supplierConfig } from '../../models/profiles/Supplier.model'

const route = useRoute()
const supplierId = route.params.id as string

// Static SEO meta
useSeoMeta({
  title: 'Supplier Profile',
  description: 'View supplier profile',
})

// Get current user for edit permission check
const { user } = useUser()
const appUser = computed(() => user.value?.app)

// Fetch supplier data via shared read composable
const { firestoreFetchDoc } = useFirestoreRead()
const supplier = supplierId
  ? await firestoreFetchDoc(supplierConfig.collectionName, supplierId)
  : null
const supplierData = computed(() => (supplier as any)?.value ?? null)

// Navigation function for edit profile
const navigateToEdit = () => {
  navigateTo('/dashboard/supplier-profile')
}

// Update head dynamically when supplier data loads
useHead({
  title: computed(() =>
    (supplier as any)?.value?.company_name
      ? `${(supplier as any)?.value?.company_name} - Supplier Profile`
      : 'Supplier Profile'
  ),
  meta: [
    {
      name: 'description',
      content: computed(
        () => (supplier as any)?.value?.bio_short || 'View supplier profile'
      ),
    },
  ],
})
</script>
