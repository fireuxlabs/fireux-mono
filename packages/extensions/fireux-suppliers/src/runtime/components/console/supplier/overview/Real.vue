<template>
  <section class="space-y-6">
    <UCard>
      <template #header><div class="text-sm font-semibold">Workspace Summary</div></template>
      <div class="grid gap-3 sm:grid-cols-4">
        <div class="space-y-1"><div class="text-xs uppercase tracking-[0.16em] text-toned">Mode</div><div class="text-sm font-medium">Real</div></div>
        <div class="space-y-1"><div class="text-xs uppercase tracking-[0.16em] text-toned">Source</div><div class="text-sm font-medium">Firestore production data</div></div>
        <div class="space-y-1"><div class="text-xs uppercase tracking-[0.16em] text-toned">Supplier Id</div><div class="font-mono text-sm">{{ runtime.id }}</div></div>
        <div class="space-y-1"><div class="text-xs uppercase tracking-[0.16em] text-toned">Is Premium</div><div class="text-sm font-medium">{{ isPremium ? 'true' : 'false' }}</div></div>
      </div>
    </UCard>
    <UCard v-if="isPremium">
      <template #header><div class="text-sm font-semibold">Premium Collection Summary</div></template>
      <div class="space-y-1"><div class="text-xs uppercase tracking-[0.16em] text-toned">Total Suppliers</div><div class="text-sm font-medium">{{ liveSupplierCount }}</div></div>
    </UCard>
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { useActiveSupplier } from '../../../../composables/fireux/app/supplier-console/useActiveSupplier'
import { useSupplierCollection } from '../../../../composables/fireux/firestore/supplier/fetch/useSupplierCollection'
const runtime = useActiveSupplier()
const { isPremium } = useUser()
const { coreSuppliers: liveSuppliers } = useSupplierCollection()
const liveSupplierCount = computed(() => liveSuppliers.value.length)
</script>
