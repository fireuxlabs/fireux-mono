<template>
  <div class="space-y-6">
    <UPageCard>
      <template #header>
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0">
            <h2 class="text-base font-semibold text-highlighted">
              {{ itemsTitle }}
            </h2>
            <p class="text-sm text-dimmed">
              {{ itemsDescription }}
            </p>
          </div>

          <UBadge color="neutral" variant="soft">
            {{ cards.length }}
          </UBadge>
        </div>
      </template>

      <div v-if="pending" class="text-sm text-dimmed">
        Loading supplier items...
      </div>
      <div v-else-if="cards.length" class="grid gap-3 md:grid-cols-2">
        <SupplierItemCardsCell
          v-for="card in cards"
          :key="card.id"
          :card="card"
          :link="false"
        />
      </div>
      <div v-else class="space-y-1">
        <p class="text-sm font-medium text-highlighted">
          {{ emptyTitle }}
        </p>
        <p class="text-sm text-dimmed">
          {{ emptyDescription }}
        </p>
      </div>
    </UPageCard>

    <DevFireuxDebugPanel
      title="Supplier items"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSupplierConsoleItems } from '../../../../../composables/fireux/console/supplier/operations/Items/useSupplierConsoleItems'
import { useSupplierItemInterface } from '../../../../../composables/fireux/supplier-item/useSupplierItemInterface'

const {
  supplierItems,
  pending,
  emptyTitle,
  emptyDescription,
  itemsTitle,
  itemsDescription,
  debug,
} = useSupplierConsoleItems()
const { interface: makeCard } = useSupplierItemInterface()

const cards = computed(() =>
  supplierItems.value
    .map((item) => makeCard(item))
    .filter((card): card is NonNullable<ReturnType<typeof makeCard>> =>
      Boolean(card)
    )
)
</script>
