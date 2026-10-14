<template>
  <div class="space-y-6">
    <UPageCard>
      <template #header>
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0">
            <h2 class="text-base font-semibold text-highlighted">
              {{ itemsTitle }}
            </h2>
            <p
              v-if="outcome === 'ready' || outcome === 'empty'"
              class="text-sm text-dimmed"
            >
              {{ itemsDescription }}
            </p>
          </div>

          <UBadge
            v-if="outcome === 'ready' || outcome === 'empty'"
            color="neutral"
            variant="soft"
          >
            {{ cards.length }}
          </UBadge>
        </div>
      </template>

      <div
        v-if="outcome === 'pending'"
        role="status"
        class="text-sm text-dimmed"
      >
        Loading supplier items...
      </div>
      <UAlert
        v-else-if="outcome === 'error'"
        color="error"
        title="Could not load supplier items"
      >
        <template #actions
          ><MoleculesCopyError message="Could not load supplier items."
        /></template>
      </UAlert>
      <p
        v-else-if="outcome !== 'ready' && outcome !== 'empty'"
        class="text-sm text-muted"
      >
        Select an available Supplier to view supplier items.
      </p>
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

    <DiagnosticsDebugPanel
      title="Supplier items"
      scope="workspace"
      object-origin="fetched"
      :objects="{ supplierItems }"
      :derived="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSupplierWorkspaceItems } from '../../../composables/workspace/items/useSupplierWorkspaceItems'
import { useSupplierItemInterface } from '../../../composables/item/useSupplierItemInterface'

const {
  supplierItems,
  outcome,
  emptyTitle,
  emptyDescription,
  itemsTitle,
  itemsDescription,
  debug,
} = useSupplierWorkspaceItems()
const { interface: makeCard } = useSupplierItemInterface()

const cards = computed(() =>
  supplierItems.value
    .map((item) => makeCard(item))
    .filter((card): card is NonNullable<ReturnType<typeof makeCard>> =>
      Boolean(card)
    )
)
</script>
