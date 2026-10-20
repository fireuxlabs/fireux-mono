<template>
  <p v-if="state.identity.outcome.value === 'pending'" role="status">
    Loading Kitchen…
  </p>
  <MoleculesStateCard
    v-else-if="state.identity.outcome.value === 'error'"
    state="error"
    title="Kitchen unavailable"
    description="Kitchen could not be loaded."
  />
  <p v-else-if="!state.kitchenId.value">
    Choose a Kitchen to view its promotions.
  </p>
  <div v-else class="grid gap-4">
    <MoleculesCopyError
      v-if="state.dishes.error.value"
      :message="String(state.dishes.error.value)"
    />
    <p v-else-if="state.dishes.pending.value" role="status">
      Loading food and drinks…
    </p>
    <MoleculesStateCard
      v-if="state.collection.outcome.value === 'error'"
      state="error"
      title="Promotions unavailable"
      :description="
        String(
          state.collection.error.value || 'Promotions could not be loaded.'
        )
      "
    />
    <p v-else-if="state.collection.pending.value" role="status">
      Loading promotions…
    </p>
    <template v-else-if="state.collection.items.value.length">
      <WorkspaceKitchenPromotionsCollectionRow
        v-for="promotion in state.collection.items.value"
        :key="promotion.id"
        :promotion="promotion"
        @edit="editPromotion(promotion)"
      />
    </template>
    <p v-else class="rounded-xl border border-default p-5 text-muted">
      No promotions yet.
    </p>
  </div>
</template>
<script setup lang="ts">
import { useKitchenPromotionsContext } from '../../../../composables/promotions/useKitchenPromotionsContext'
const { state, editPromotion } = useKitchenPromotionsContext()
</script>
