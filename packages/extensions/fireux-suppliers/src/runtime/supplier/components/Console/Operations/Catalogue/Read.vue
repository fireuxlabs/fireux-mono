<template>
  <div class="space-y-6">
    <UPageCard>
      <template #header>
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0">
            <h2 class="text-base font-semibold text-highlighted">
              {{ catalogueTitle }}
            </h2>
            <p class="text-sm text-dimmed">
              {{ catalogueDescription }}
            </p>
          </div>

          <UBadge color="neutral" variant="soft">
            {{ cards.length }}
          </UBadge>
        </div>
      </template>

      <div v-if="pending" class="text-sm text-dimmed">
        Loading supplier catalogue...
      </div>
      <div v-else-if="cards.length" class="space-y-4">
        <SupplierCataloguePresentation
          v-for="card in cards"
          :key="card.id"
          v-bind="card"
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

    <DevDebugPanel
      title="Supplier catalogue"
      scope="console"
      object-origin="fetched"
      :objects="{ catalogues }"
      :derived="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSupplierConsoleCatalogue } from '../../../../composables/console/operations/Catalogue/useSupplierConsoleCatalogue'
import { useSupplierCatalogueInterface } from '../../../../composables/firestore/utils/view/useSupplierCatalogueInterface'

const {
  catalogues,
  pending,
  catalogueTitle,
  catalogueDescription,
  emptyTitle,
  emptyDescription,
  debug,
} = useSupplierConsoleCatalogue()
const { pill } = useSupplierCatalogueInterface()

const cards = computed(() =>
  catalogues.value
    .map((catalogue) => pill(catalogue))
    .filter((card): card is NonNullable<ReturnType<typeof pill>> =>
      Boolean(card)
    )
)
</script>
