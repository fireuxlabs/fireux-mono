<template>
  <section class="console-surface space-y-6">
    <OrganismsConsoleSupplierProductsRead />

    <OrganismsConsoleSupplierProductsWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { useSupplierConsoleProducts } from '../../../../composables/fireux/console/supplier/operations/useSupplierConsoleProducts'

const { canWrite } = useSupplierConsoleProducts()
</script>
