<template>
  <section class="console-surface space-y-6">
    <OrganismsConsoleSupplierCatalogueRead />

    <OrganismsConsoleSupplierCatalogueWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { useSupplierConsoleCatalogue } from '../../../composables/fireux/app/supplier-console/useSupplierConsoleCatalogue'

const { canWrite } = useSupplierConsoleCatalogue()
</script>
