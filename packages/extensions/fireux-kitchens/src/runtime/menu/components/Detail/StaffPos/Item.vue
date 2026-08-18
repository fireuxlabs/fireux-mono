<template>
  <article class="staff-pos-item">
    <button type="button" class="staff-pos-item__button" @click="addItem">
      <span class="staff-pos-item__media">
        <img
          v-if="item.imageUrl"
          :src="item.imageUrl"
          :alt="item.name"
          loading="lazy"
        >
        <UIcon v-else name="i-lucide-utensils" aria-hidden="true" />
      </span>

      <span class="staff-pos-item__body">
        <strong>{{ item.name }}</strong>
        <span v-if="displayPrice">{{ displayPrice }}</span>
      </span>

      <UIcon name="i-lucide-plus" aria-hidden="true" />
    </button>

    <div
      v-if="variantOptions.length > 1 || addOnOptions.length"
      class="staff-pos-item__options"
    >
      <MenuDetailItemOptions
        v-if="variantOptions.length > 1"
        :label="`${item.name} variants`"
        :options="variantOptions"
        :selected-ids="selectedVariant ? [selectedVariant.id] : []"
        @toggle="selectedVariantId = $event"
      />

      <MenuDetailItemOptions
        v-if="addOnOptions.length"
        :label="`${item.name} add-ons`"
        :options="addOnOptions"
        :selected-ids="selectedAddOnIds"
        prefix="+ "
        @toggle="toggleAddOn"
      />
    </div>
  </article>
</template>

<script setup lang="ts">
import { useItem } from '../../../composables/detail/useItem'
import type {
  MenuFoodItem,
  MenuFoodOrderItem,
} from '../../../models/menu-food.model.ts'

const props = defineProps<{
  item: MenuFoodItem
}>()

const emit = defineEmits<{
  (event: 'add', item: MenuFoodOrderItem): void
}>()

const {
  addOnOptions,
  displayPrice,
  orderItem,
  selectedAddOnIds,
  selectedVariant,
  selectedVariantId,
  toggleAddOn,
  variantOptions,
} = useItem({
  item: () => props.item,
})

function addItem() {
  emit('add', orderItem.value)
}
</script>

<style scoped>
.staff-pos-item {
  display: grid;
  gap: calc(var(--spacing) * 2);
}

.staff-pos-item__button {
  display: grid;
  grid-template-columns: 4.25rem minmax(0, 1fr) auto;
  gap: 0.85rem;
  align-items: center;
  width: 100%;
  min-height: 5.25rem;
  padding: 0.65rem calc(var(--spacing) * 3);
  border: 1px solid color-mix(in srgb, var(--menu-text) 12%, transparent);
  border-radius: calc(var(--ui-radius) * 3);
  background: color-mix(in srgb, var(--menu-bg) 92%, var(--menu-text));
  color: var(--menu-text);
  cursor: pointer;
  font: inherit;
  text-align: left;
}

.staff-pos-item__options {
  display: grid;
  gap: 0.45rem;
  padding: 0 0.2rem 0.2rem;
}

.staff-pos-item__button:hover,
.staff-pos-item__button:focus-visible {
  border-color: color-mix(in srgb, var(--menu-primary) 42%, transparent);
  background: color-mix(in srgb, var(--menu-primary) 8%, var(--menu-bg));
}

.staff-pos-item__button:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--menu-primary) 70%, white);
  outline-offset: 0.18rem;
}

.staff-pos-item__media {
  display: grid;
  width: 4.25rem;
  height: 4.25rem;
  overflow: hidden;
  place-items: center;
}

.staff-pos-item__media img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  transform: scale(1.75);
}

.staff-pos-item__media :deep(.iconify) {
  width: 1.8rem;
  height: 1.8rem;
  color: var(--menu-muted);
}

.staff-pos-item__body {
  display: grid;
  gap: var(--spacing);
  min-width: 0;
}

.staff-pos-item__body strong {
  overflow: hidden;
  font-size: 0.98rem;
  font-weight: var(--font-weight-black);
  line-height: 1.15;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.staff-pos-item__body span {
  color: var(--menu-primary);
  font-size: 0.92rem;
  font-weight: var(--font-weight-black);
}

.staff-pos-item__button > :deep(.iconify) {
  width: 1.2rem;
  height: 1.2rem;
  color: var(--menu-primary);
}
</style>
