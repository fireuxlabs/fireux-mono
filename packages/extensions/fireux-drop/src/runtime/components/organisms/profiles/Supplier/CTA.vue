<template>
  <UPageCTA
    class="cta"
    title="Supplier profile"
    description="Create your supplier profile so chefs can discover you."
    variant="subtle"
    orientation="horizontal"
  >
    <div v-if="card()" class="cta__body space-y-4">
      <ProfilesSupplierCardsPreview v-bind="card()" :link="true" />
    </div>

    <div v-else class="cta__body space-y-2">
      <ProfilesSupplierCreateSystem />
    </div>
  </UPageCTA>
</template>

<script setup lang="ts">
import { useSupplier } from '../../../../composables/fireux/firestore/profiles/Supplier/useSupplier';

const { card } = useSupplier()

</script>

