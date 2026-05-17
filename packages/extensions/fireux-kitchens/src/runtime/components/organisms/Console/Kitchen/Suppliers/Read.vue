<template>
  <div class="space-y-6">
    <OrganismsSupplierCollectionManager
      :collection="suppliers"
      title="Suppliers"
      description="Browse suppliers for the selected kitchen."
      :link="true"
    />

    <DevFireuxDebugPanel
      v-if="isDev"
      title="Kitchen suppliers"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { useKitchenConsoleSuppliers } from '../../../../../composables/fireux/console/kitchen/operations/useKitchenConsoleSuppliers'

const { suppliers, debug } = useKitchenConsoleSuppliers()
const isDev = import.meta.dev
</script>
