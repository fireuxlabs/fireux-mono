<template>
  <p v-if="outcome === 'pending'" role="status">Loading suppliers…</p>
  <UAlert
    v-else-if="outcome === 'error'"
    color="error"
    title="Suppliers could not be loaded"
    ><template #actions
      ><FireCopyError message="Suppliers could not be loaded." /></template
  ></UAlert>
  <p v-else-if="outcome !== 'ready' && outcome !== 'empty'">
    Select an available Kitchen to view suppliers.
  </p>
  <template v-else-if="cards.length">
    <p role="status">
      {{ cards.length }} {{ cards.length === 1 ? 'supplier' : 'suppliers' }}
    </p>
    <div class="fx-card-body-stack">
      <WorkspaceKitchenStockSuppliersCardsCell
        v-for="card in cards"
        :key="card.id"
        v-bind="card"
        :link="true"
      />
    </div>
  </template>

  <p v-else>No suppliers found.</p>
</template>
<script setup lang="ts">
import type { useSupplierInterface } from 'fireux-suppliers/runtime/supplier/composables/firestore/utils/view/useSupplierInterface'

type SupplierCell = NonNullable<
  ReturnType<ReturnType<typeof useSupplierInterface>['cell']>
>
defineProps<{ cards: SupplierCell[]; outcome: string }>()
</script>
