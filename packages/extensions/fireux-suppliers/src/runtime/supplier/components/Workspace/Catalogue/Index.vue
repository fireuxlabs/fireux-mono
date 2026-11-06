<template>
  <section class="workspace-surface space-y-6">
    <UPageCard>
      <template #header>
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0">
            <h2 class="fx-type-section-title">
              {{ catalogueTitle }}
            </h2>
            <p v-if="outcome === 'ready' || outcome === 'empty'">
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

      <div v-if="outcome === 'pending'" role="status">
        Loading supplier catalogue...
      </div>
      <UAlert
        v-else-if="outcome === 'error'"
        color="error"
        title="Could not load supplier catalogue"
      >
        <template #actions
          ><FireCopyError message="Could not load supplier catalogue."
        /></template>
      </UAlert>
      <p v-else-if="outcome !== 'ready' && outcome !== 'empty'">
        Select an available Supplier to view supplier catalogue.
      </p>
      <div
        v-else-if="cards.length"
        class="workspace-surface workspace-surface--compact"
      >
        <SupplierCatalogueDetail
          v-for="card in cards"
          :key="card.id"
          v-bind="card"
        />
      </div>
      <div v-else class="space-y-1">
        <p>
          {{ emptyTitle }}
        </p>
        <p>
          {{ emptyDescription }}
        </p>
      </div>
    </UPageCard>

    <FireDiagnosticsDebugPanel
      title="Supplier catalogue"
      scope="workspace"
      object-origin="fetched"
      :objects="{ catalogues }"
      :derived="debug"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSupplierWorkspaceCatalogues } from '../../../composables/workspace/catalogue/useSupplierWorkspaceCatalogues'
import { useSupplierCatalogueInterface } from '../../../composables/firestore/utils/view/useSupplierCatalogueInterface'

const {
  catalogues,
  outcome,
  catalogueTitle,
  catalogueDescription,
  emptyTitle,
  emptyDescription,
  debug,
} = useSupplierWorkspaceCatalogues()
const { pill } = useSupplierCatalogueInterface()

const cards = computed(() =>
  catalogues.value
    .map((catalogue) => pill(catalogue))
    .filter((card): card is NonNullable<ReturnType<typeof pill>> =>
      Boolean(card)
    )
)
</script>
