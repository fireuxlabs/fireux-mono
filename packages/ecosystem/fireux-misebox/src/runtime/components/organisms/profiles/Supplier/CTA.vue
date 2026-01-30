<template>
  <UPageCTA
    class="cta"
    title="Supplier profile"
    description="Introduce your products to chefs and venues across the FireUX network."
    variant="subtle"
    orientation="horizontal"
  >
    <template #default>
      <div v-if="card()" class="cta__body space-y-4">
        <OrganismsProfilesSupplierCardsPreview v-bind="card()" />
      </div>

      <div v-else class="cta__body space-y-2">
        <OrganismsProfilesSupplierCreateSystem />
      </div>
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
import { useSupplier } from '../../../../composables/fireux/firestore/profiles/Supplier/useSupplier.ts';

const { card } = useSupplier()

</script>

