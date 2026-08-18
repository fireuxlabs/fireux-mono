<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <div class="collection-manager__header">
          <div class="collection-manager__title">
            <h2>Suppliers</h2>
            <p>Browse suppliers for the selected kitchen.</p>
          </div>

          <UBadge variant="soft">{{ cards.length }}</UBadge>
        </div>
      </template>

      <div v-if="cards.length" class="space-y-3">
        <ConsoleKitchenOperationsSuppliersCardsCell
          v-for="card in cards"
          :key="card.id"
          v-bind="card"
          :link="true"
        />
      </div>

      <p v-else class="text-sm text-dimmed">
        No suppliers found.
      </p>
    </UCard>

    <DevDebugPanel
      title="Kitchen suppliers"
      scope="console"
      object-origin="fetched"
      :objects="{ suppliers }"
      :derived="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSupplierInterface } from 'fireux-suppliers/runtime/supplier/composables/firestore/utils/view/useSupplierInterface'
import { useKitchenConsoleSuppliers } from '../../../../composables/console/operations/Suppliers/useKitchenConsoleSuppliers'

const { suppliers, debug } = useKitchenConsoleSuppliers()
const { cell } = useSupplierInterface()
const cards = computed(() =>
  suppliers.value
    .map((supplier) => {
      const card = cell(supplier)
      return card
        ? {
            ...card,
            to: `/console/kitchen/suppliers/${
              encodeURIComponent(card.id)
            }`,
          }
        : null
    })
    .filter((card): card is NonNullable<ReturnType<typeof cell>> =>
      Boolean(card)
    )
)
</script>
