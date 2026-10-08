<template>
  <div class="space-y-6">
    <UPageCard>
      <template #header>
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0">
            <h2 class="text-base font-semibold text-highlighted">
              {{ catalogueTitle }}
            </h2>
            <p
              v-if="outcome === 'ready' || outcome === 'empty'"
              class="text-sm text-dimmed"
            >
              {{ catalogueDescription }}
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
        Loading supplier catalogue...
      </div>
      <UAlert
        v-else-if="outcome === 'error'"
        color="error"
        title="Could not load supplier catalogue"
      >
        <template #actions
          ><MoleculesCopyError message="Could not load supplier catalogue."
        /></template>
      </UAlert>
      <p
        v-else-if="outcome !== 'ready' && outcome !== 'empty'"
        class="text-sm text-muted"
      >
        Select an available Supplier to view supplier catalogue.
      </p>
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
      scope="workspace"
      object-origin="fetched"
      :objects="{ catalogues }"
      :derived="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSupplierWorkspaceCatalogue } from '../../../composables/workspace/catalogue/useSupplierWorkspaceCatalogue'
import { useSupplierCatalogueInterface } from '../../../composables/firestore/utils/view/useSupplierCatalogueInterface'

const {
  catalogues,
  outcome,
  catalogueTitle,
  catalogueDescription,
  emptyTitle,
  emptyDescription,
  debug,
} = useSupplierWorkspaceCatalogue()
const { pill } = useSupplierCatalogueInterface()

const cards = computed(() =>
  catalogues.value
    .map((catalogue) => pill(catalogue))
    .filter((card): card is NonNullable<ReturnType<typeof pill>> =>
      Boolean(card)
    )
)
</script>
