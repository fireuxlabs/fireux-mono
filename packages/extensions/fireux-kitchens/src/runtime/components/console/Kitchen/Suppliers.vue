<template>
  <section class="console-surface space-y-4">
    <OrganismsConsoleKitchenSuppliersRead
      :suppliers="suppliers"
      :pending="pending"
    />

    <OrganismsConsoleKitchenSuppliersWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleSuppliers } from '../../../composables/fireux/app/kitchen-console/useKitchenConsoleSuppliers'

const { suppliers, pending, canWrite } = useKitchenConsoleSuppliers()
</script>
