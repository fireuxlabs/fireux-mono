<template>
  <ClientOnly>
    <div>
      <div v-if="supplier">
        <h2>Edit Supplier Profile</h2>
        <MiseProfilesSupplierEdit :supplier="supplier" />
      </div>
      <div v-else>
        <MiseProfilesSupplierCTA />
      </div>
    </div>

    <template #fallback>
      <div class="loading-state">
        <h1>Loading supplier profile editor...</h1>
      </div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { supplierConfig } from '../../models/profiles/Supplier.model'

// Define static page meta first
definePageMeta({
  title: 'Edit Supplier Profile',
  description: 'Edit your supplier profile',
})

// Get current user
const { appUser, hasProfile } = await useAppUser()

// Use our unified profile composable
const { current: supplier } = await useProfile(supplierConfig)
</script>
