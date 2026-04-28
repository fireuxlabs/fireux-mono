<template>
  <section class="console-surface space-y-6">
    <OrganismsConsoleKitchenSuppliersRead :suppliers="suppliers" />

    <OrganismsConsoleKitchenSuppliersWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleSuppliers } from '../../../composables/fireux/app/kitchen-console/useKitchenConsoleSuppliers'

const { suppliers, canWrite } = useKitchenConsoleSuppliers()
</script>
