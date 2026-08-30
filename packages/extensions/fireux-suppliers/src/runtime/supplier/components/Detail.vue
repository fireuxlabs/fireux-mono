<template>
  <article class="space-y-8">
    <SupplierDetailHeader :supplier="supplier" />
    <SupplierDetailContent :supplier="supplier" />
    <SupplierDetailCompany :supplier="supplier" />
    <SupplierDetailAdmin :supplier="supplier" />
  </article>
</template>

<script setup lang="ts">
import type { Supplier } from '../models/Supplier.model'
defineProps<{ supplier: Supplier }>()
</script>
