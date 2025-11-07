<template>
  <UPage>
    <UContainer class="py-8">
      <OrganismsProfileRoot
        :config="supplierConfig"
        :onEnsure="onEnsureSupplier"
      >
        <!-- Current profile (optional) -->
        <template #current-assets="{ profile }">
          <template v-if="profile">
            <div class="space-y-3">
              <OrganismsProfilesSupplierCardsPill
                :supplier="pillProps(profile)"
              />
              <OrganismsProfilesSupplierCardsCell
                :supplier="cellProps(profile)"
              />
            </div>
          </template>
        </template>

        <!-- List items -->
        <template #item="{ profile }">
          <div class="space-y-3">
            <OrganismsProfilesSupplierCardsPill
              :supplier="pillProps(profile)"
            />
            <OrganismsProfilesSupplierCardsCell
              :supplier="cellProps(profile)"
            />
          </div>
        </template>
      </OrganismsProfileRoot>
    </UContainer>
  </UPage>
</template>

<script setup lang="ts">
import { supplierConfig } from '../../models/profiles/Supplier.model'
import { useSupplier } from '../../composables/firestore/profiles/Supplier/useSupplier.ts'
import { useSupplierCreate } from '../../composables/firestore/profiles/Supplier/main/useSupplierCreate.ts'

const { pillProps, cellProps } = useSupplier()
const { createSupplier } = useSupplierCreate()
async function onEnsureSupplier() {
  await createSupplier()
}
</script>
