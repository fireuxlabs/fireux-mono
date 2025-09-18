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
import { useSeoMeta } from 'nuxt/app'
import { supplierConfig } from '../../models/profiles/Supplier.model'
import { useUser } from 'fireux-core/runtime/composables/firestore/user/useUser'
import { useProfile } from 'fireux-core/runtime/composables/firestore/profiles/useProfile'

// Define static page meta first
useSeoMeta({
  title: 'Edit Supplier Profile',
  description: 'Edit your supplier profile',
})

// Touch user to ensure auth-derived state is reactive if needed later
useUser()

// Use our unified profile composable
const { current: supplier } = useProfile(supplierConfig)
</script>
