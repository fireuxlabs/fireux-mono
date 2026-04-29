<template>
  <section class="console-surface space-y-6">
    <OrganismsConsoleSupplierProductsRead />

    <OrganismsConsoleSupplierProductsWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { useSupplierConsoleProducts } from '../../../composables/fireux/app/supplier-console/useSupplierConsoleProducts'

const { canWrite } = useSupplierConsoleProducts()
</script>
