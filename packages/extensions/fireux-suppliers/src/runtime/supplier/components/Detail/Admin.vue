<template>
  <SupplierDetailOperatorPanel :supplier="supplier" />
</template>

<script setup lang="ts">
import type { Supplier } from '../../models/Supplier.model'
defineProps<{ supplier: Supplier }>()
</script>
