<template>
  <p v-if="state.identity.outcome.value === 'pending'" role="status">
    Loading Kitchen…
  </p>
  <UAlert
    v-else-if="state.identity.outcome.value === 'error'"
    title="Kitchen unavailable"
    description="Kitchen could not be loaded."
    color="error"
    variant="soft"
    role="alert"
    aria-live="assertive"
  >
    <template #actions>
      <FireCopyError
        message="Kitchen unavailable&#10;Kitchen could not be loaded."
      />
    </template>
  </UAlert>
  <p v-else-if="!state.kitchenId.value">
    Choose a Kitchen to view its promotions.
  </p>
  <div v-else class="workspace-surface workspace-surface--compact">
    <FireCopyError
      v-if="state.dishes.error.value"
      :message="String(state.dishes.error.value)"
    />
    <p v-else-if="state.dishes.pending.value" role="status">
      Loading food and drinks…
    </p>
    <UAlert
      v-if="state.collection.outcome.value === 'error'"
      title="Promotions unavailable"
      :description="
        String(
          state.collection.error.value || 'Promotions could not be loaded.'
        )
      "
      color="error"
      variant="soft"
      role="alert"
      aria-live="assertive"
    >
      <template #actions>
        <FireCopyError
          :message="
            [
              'Promotions unavailable',
              String(
                state.collection.error.value ||
                  'Promotions could not be loaded.'
              ),
            ]
              .filter(Boolean)
              .join('\n')
          "
        />
      </template>
    </UAlert>
    <p v-else-if="state.collection.pending.value" role="status">
      Loading promotions…
    </p>
    <template v-else>
      <ul v-if="visible.length" aria-label="Promotions" class="promotion-list">
        <KitchenWorkspaceMenuPromotionsCollectionRow
          v-for="promotion in visible"
          :key="promotion.id"
          :promotion="promotion"
          @edit="editPromotion(promotion)"
        />
      </ul>
      <p v-else role="status">
        {{ query.trim() ? 'No matching promotions.' : 'No promotions yet.' }}
      </p>
    </template>
  </div>
</template>
<script setup lang="ts">
import type { KitchenPromotion } from '../../../../../records/menus/promotions/promotion'
import { useKitchenPromotionsContext } from '../../../../../composables/promotions/useKitchenPromotionsContext'

defineProps<{ visible: KitchenPromotion[]; query: string }>()
const { state, editPromotion } = useKitchenPromotionsContext()
</script>

<style scoped>
.promotion-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.promotion-list > li + li {
  border-block-start: 1px solid var(--ui-border);
}
</style>
