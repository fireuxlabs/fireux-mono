<template>
  <UCard>
    <template #header>Company</template>
    {{ supplier.company_id }}
  </UCard>
</template>

<script setup lang="ts">
import type { Supplier } from '../../models/Supplier.model'
defineProps<{ supplier: Supplier }>()
</script>
