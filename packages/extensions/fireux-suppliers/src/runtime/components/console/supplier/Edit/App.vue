<template>
  <ClientOnly>
    <div v-if="supplier" class="space-y-6">
      <UCard>
        <p class="text-sm opacity-70">
          App-specific supplier settings are not available yet.
        </p>
      </UCard>
    </div>

    <MoleculesStateCard
      v-else
      entity="supplier app profile"
      kind="document"
      loading
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import type { SupplierCore } from 'fireux-suppliers/runtime/models/supplier/Supplier.model'

defineProps<{
  supplier: Partial<SupplierCore> | null | undefined
}>()
</script>
