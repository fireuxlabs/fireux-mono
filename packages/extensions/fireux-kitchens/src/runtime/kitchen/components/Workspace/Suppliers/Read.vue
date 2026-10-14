<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <div class="collection-manager__header">
          <div class="collection-manager__title">
            <h2>Suppliers</h2>
            <p>Browse suppliers for the selected kitchen.</p>
          </div>

          <UBadge v-if="outcome === 'ready' || outcome === 'empty'" variant="soft">{{ cards.length }}</UBadge>
        </div>
      </template>

      <p v-if="outcome === 'pending'" role="status" class="text-sm text-muted">Loading suppliers…</p>
      <UAlert v-else-if="outcome === 'error'" color="error" title="Suppliers could not be loaded"><template #actions><MoleculesCopyError message="Suppliers could not be loaded." /></template></UAlert>
      <p v-else-if="outcome !== 'ready' && outcome !== 'empty'" class="text-sm text-muted">Select an available Kitchen to view suppliers.</p>
      <div v-else-if="cards.length" class="space-y-3">
        <WorkspaceKitchenSuppliersCardsCell
          v-for="card in cards"
          :key="card.id"
          v-bind="card"
          :link="true"
        />
      </div>

      <p v-else class="text-sm text-dimmed">No suppliers found.</p>
    </UCard>

    <DiagnosticsDebugPanel
      title="Kitchen suppliers"
      scope="workspace"
      object-origin="fetched"
      :objects="{ suppliers }"
      :derived="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSupplierInterface } from 'fireux-suppliers/runtime/supplier/composables/firestore/utils/view/useSupplierInterface'
import { useKitchenWorkspaceSuppliers } from '../../../composables/workspace/suppliers/useKitchenWorkspaceSuppliers'

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
