<template>
  <article :class="['menu-item', item.imageUrl && 'menu-item--with-image']">
    <div
      v-if="item.imageUrl"
      class="menu-item__media"
    >
      <img
        :src="item.imageUrl"
        :alt="item.name"
        loading="lazy"
      >
    </div>

    <div class="menu-item__copy">
      <h3>{{ item.name }}</h3>
      <p v-if="item.description">
        {{ item.description }}
      </p>

      <MenuDetailItemOptions
        v-if="orderMode && variantOptions.length > 1"
        :label="`${item.name} variants`"
        :options="variantOptions"
        :selected-ids="selectedVariant ? [selectedVariant.id] : []"
        @toggle="selectedVariantId = $event"
      />

      <MenuDetailItemOptions
        v-if="orderMode && addOnOptions.length"
        :label="`${item.name} add-ons`"
        :options="addOnOptions"
        :selected-ids="selectedAddOnIds"
        prefix="+ "
        @toggle="toggleAddOn"
      />
    </div>

    <div
      v-if="item.priceLabel || orderMode"
      class="menu-item__actions"
    >
      <p v-if="!orderMode && item.priceLabel" class="menu-item__price">
        {{ item.priceLabel }}
      </p>

      <MenuDetailItemQuantityControl
        v-if="orderMode"
        :label="item.name"
        :quantity="quantity"
        @add="$emit('add', orderItem)"
        @remove="$emit('remove', orderItem)"
      />

      <p v-if="orderMode && displayPrice" class="menu-item__price">
        {{ displayPrice }}
      </p>
    </div>
  </article>
</template>

<script setup lang="ts">
import type {
  MenuFoodItem,
  MenuFoodOrderItem,
} from '../../../../models/kitchen/menu/menu-food.model'
import { useItem } from '../../../../composables/fireux/menu/detail/useItem'

const props = defineProps<{
  item: MenuFoodItem
  orderMode?: boolean
  quantities?: Record<string, number>
}>()

defineEmits<{
  (event: 'add', item: MenuFoodOrderItem): void
  (event: 'remove', item: MenuFoodOrderItem): void
}>()

const {
  addOnOptions,
  displayPrice,
  orderItem,
  quantity,
  selectedAddOnIds,
  selectedVariant,
  selectedVariantId,
  toggleAddOn,
  variantOptions,
} = useItem({
  item: () => props.item,
  quantities: () => props.quantities,
})
</script>

<style scoped>
.menu-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: var(--menu-space-md);
  align-items: start;
  padding-bottom: 0.7rem;
  border-bottom: 1px solid color-mix(in srgb, var(--menu-text) 18%, transparent);
  text-align: left;
}

.menu-item--with-image {
  grid-template-columns: 5.5rem minmax(0, 1fr) auto;
}

.menu-item:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.menu-item__media {
  overflow: hidden;
  width: 5.5rem;
  aspect-ratio: 1;
  border: 1px solid color-mix(in srgb, var(--menu-text) 12%, transparent);
  border-radius: var(--menu-radius);
  background: color-mix(in srgb, var(--menu-text) 8%, transparent);
}

.menu-item__media img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.menu-item__copy,
.menu-item__actions {
  display: grid;
}

.menu-item__copy {
  gap: var(--menu-space-2xs);
}

.menu-item__actions {
  display: flex;
  gap: var(--menu-space-sm);
  align-items: center;
  justify-content: end;
}

.menu-item h3,
.menu-item p {
  margin: 0;
}

.menu-item h3 {
  font-size: 1.1rem;
  font-weight: 850;
  letter-spacing: -0.03em;
  color: var(--menu-title);
}

.menu-item__copy p {
  color: var(--menu-muted);
  font-size: 0.9rem;
  line-height: 1.35;
}

.menu-item__price {
  color: var(--menu-primary);
  font-size: 0.95rem;
  font-weight: 850;
  white-space: nowrap;
}

@media (max-width: 620px) {
  .menu-item--with-image {
    grid-template-columns: 4.75rem minmax(0, 1fr) auto;
    gap: var(--menu-space-sm);
  }

  .menu-item__media {
    width: 4.75rem;
    border-radius: var(--menu-radius);
  }
}
</style>
