<template>
  <FireCollectionRow as="li" class="promotion-row">
    <h2 class="fx-type-card-heading">{{ promotion.name }}</h2>
    <p class="fx-type-caption">
      {{ 'groups' in promotion ? 'Meal deal' : 'Item offer' }}
    </p>
    <template #value>
      <UBadge
        :label="promotion.status === 'active' ? 'Active' : 'Paused'"
        :color="promotion.status === 'active' ? 'success' : 'neutral'"
        variant="soft"
      />
    </template>
    <template #actions>
      <UButton
        label="Edit"
        :aria-label="`Edit ${promotion.name}`"
        color="neutral"
        variant="ghost"
        :disabled="!canEdit"
        @click="emit('edit')"
      />
    </template>
  </FireCollectionRow>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenPromotion } from '../../../../../records/menus/promotions/promotion'
import { useKitchenPromotionsContext } from '../../../../../composables/promotions/useKitchenPromotionsContext'
defineProps<{ promotion: KitchenPromotion }>()
const emit = defineEmits<{ edit: [] }>()
const { state } = useKitchenPromotionsContext()
const canEdit = computed(
  () =>
    state.canWrite.value &&
    ['ready', 'empty'].includes(state.dishes.outcome.value)
)
</script>

<style scoped>
.promotion-row {
  padding-block: calc(var(--spacing) * 3);
}
.promotion-row h2,
.promotion-row p {
  margin: 0;
}
</style>
