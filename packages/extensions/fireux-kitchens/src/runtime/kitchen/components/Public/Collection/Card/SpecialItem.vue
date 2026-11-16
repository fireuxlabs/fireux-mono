<template>
  <div class="kitchen-special-item">
    <MenuItemImage
      :enabled="Boolean(item.imageUrl)"
      :image-url="item.imageUrl"
    />
    <div>
      <h4>{{ item.name }}</h4>
      <p v-if="price" class="kitchen-special-item__price">{{ price }}</p>
      <p v-if="item.description">{{ item.description }}</p>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenDirectoryEntry } from '../../../../types/public'
import { formatCurrencyAmount } from '../../../../../utils/currency-display'
const props = defineProps<{
  item: NonNullable<KitchenDirectoryEntry['special']>['items'][number]
  currencyCode?: string
}>()
const price = computed(() =>
  props.currencyCode
    ? formatCurrencyAmount(props.item.price, {
        currencyCode: props.currencyCode,
        format: 'code',
      })
    : ''
)
</script>
<style scoped>
.kitchen-special-item {
  display: flex;
  gap: calc(var(--spacing) * 3);
  margin-top: calc(var(--spacing) * 2);
}
.kitchen-special-item h4 {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--ui-text-highlighted);
}
.kitchen-special-item p {
  margin-top: var(--spacing);
}
.kitchen-special-item__price {
  font-weight: var(--font-weight-semibold);
  color: var(--ui-text-highlighted);
}
</style>
