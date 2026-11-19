<template>
  <section class="workspace-surface">
    <WorkspacePageHeader
      title="Suppliers"
      description="Browse suppliers for the selected kitchen."
      variant="child"
    />
    <Collection :cards="cards" :outcome="outcome" />
    <FireDiagnosticsDebugPanel
      title="Kitchen suppliers"
      scope="workspace"
      object-origin="fetched"
      :objects="{ suppliers }"
      :derived="debug"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Collection from './Collection.vue'
import { useSupplierInterface } from 'fireux-suppliers/runtime/supplier/composables/firestore/utils/view/useSupplierInterface'
import { useKitchenWorkspaceSuppliers } from '../../../../composables/workspace/stock/suppliers/useKitchenWorkspaceSuppliers'

const { suppliers, outcome, debug } = useKitchenWorkspaceSuppliers()
const { cell } = useSupplierInterface()
const cards = computed(() =>
  suppliers.value
    .map((supplier) => {
      const card = cell(supplier)
      return card
        ? {
            ...card,
            to: `/workspace/kitchen/stock/suppliers/${encodeURIComponent(card.id)}`,
          }
        : null
    })
    .filter((card): card is NonNullable<ReturnType<typeof cell>> =>
      Boolean(card)
    )
)
</script>
