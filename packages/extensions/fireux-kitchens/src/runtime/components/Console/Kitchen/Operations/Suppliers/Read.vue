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

    <DevFireuxDebugPanel
      title="Kitchen suppliers"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSupplierInterface } from 'fireux-suppliers/runtime/composables/fireux/firestore/supplier/utils/view/useSupplierInterface'
import { useKitchenConsoleSuppliers } from '../../../../../composables/fireux/console/kitchen/operations/Suppliers/useKitchenConsoleSuppliers'

const { suppliers, debug } = useKitchenConsoleSuppliers()
const { cell } = useSupplierInterface()
const cards = computed(() =>
  suppliers.value
    .map((supplier) => cell(supplier))
    .filter((card): card is NonNullable<ReturnType<typeof cell>> =>
      Boolean(card)
    )
)
</script>
