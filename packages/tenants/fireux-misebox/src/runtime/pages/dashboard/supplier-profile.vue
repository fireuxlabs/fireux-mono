<template>
  <UPage>
    <UPageBody>
      <OrganismsProfileRoot :config="supplierConfig">
        <!-- When a profile exists, render the editor -->
        <template #current-assets="{ profile }">
          <div v-if="profile">
            <h2 class="mb-4">Edit Supplier Profile</h2>
            <MiseProfilesSupplierEdit :supplier="profile" />
          </div>
        </template>

        <!-- Optional: omit list rendering by leaving #item empty -->
        <template #item="{ profile }"></template>
      </OrganismsProfileRoot>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { supplierConfig } from '../../models/profiles/Supplier.model'
definePageMeta({ layout: 'dashboard' })
</script>
