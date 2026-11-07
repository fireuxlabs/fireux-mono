<template>
  <UCard>
    <template #header>Catalogue</template>
    <dl>
      <div>
        <dt>State</dt>
        <dd>{{ supplier.catalogue.mode }}</dd>
      </div>
      <div>
        <dt>Supplier status</dt>
        <dd>{{ supplier.identity.status }}</dd>
      </div>
    </dl>
  </UCard>
</template>

<script setup lang="ts">
import type { Supplier } from '../../models/Supplier.model'
defineProps<{ supplier: Supplier }>()
</script>
