<template>
  <UPage>
    <UPageBody>
      <UPageSection>
        <!-- Profiles via reusable Root (aligned with Chef pattern) -->
        <OrganismsProfileRoot
          :config="supplierConfig"
          :onEnsure="createSupplier"
        >
          <!-- Current profile (optional) -->
          <template #current-assets="{ profile }">
            <template v-if="profile">
              <OrganismsProfilesSupplierCardsPill
                :supplier="profile"
                class="mb-3"
              />
              <OrganismsProfilesSupplierCardsCell :supplier="profile" />
            </template>
          </template>

          <!-- List items -->
          <template #item="{ profile }">
            <OrganismsProfilesSupplierCardsCell :supplier="profile" />
          </template>
        </OrganismsProfileRoot>
      </UPageSection>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { supplierConfig } from '../../models/profiles/Supplier.model'
import { useSupplierCreate } from '../../composables/firestore/profiles/Supplier/useSupplierCreate'

const { createSupplier } = useSupplierCreate()
</script>
