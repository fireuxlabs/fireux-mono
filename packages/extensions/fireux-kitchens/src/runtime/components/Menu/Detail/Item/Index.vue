<template>
  <article
    :class="[
      'menu-item',
      'menu-item--selectable',
      selected && 'menu-item--selected',
    ]"
  >
    <div
      :class="[
        'menu-item__summary',
        item.imageUrl && 'menu-item__summary--with-image',
      ]"
      role="button"
      tabindex="0"
      :aria-expanded="selected"
      @click="selectItem"
      @keydown.enter.prevent="selectItem"
      @keydown.space.prevent="selectItem"
    >
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
      </div>

      <div
        v-if="item.priceLabel || orderMode"
        class="menu-item__actions"
      >
        <p v-if="!orderMode && item.priceLabel" class="menu-item__price">
          {{ item.priceLabel }}
        </p>

        <p v-if="orderMode && displayPrice" class="menu-item__price">
          {{ displayPrice }}
        </p>
      </div>
    </div>

    <div
      v-if="selected && hasInteraction"
      class="menu-item__interaction"
      @click.stop
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

      <button
        v-if="orderMode"
        type="button"
        class="menu-item__add"
        @click="addItem"
      >
        <UIcon name="i-lucide-shopping-basket" aria-hidden="true" />
        <span>Add</span>
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type {
  MenuFoodItem,
  MenuFoodOrderItem,
} from '../../../../models/kitchen/menu/menu-food.model'
import { useItem } from '../../../../composables/fireux/menu/detail/useItem'

const props = defineProps<{
  item: MenuFoodItem
  orderMode?: boolean
  selected?: boolean
}>()

const emit = defineEmits<{
  (event: 'select', item: MenuFoodItem): void
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

const hasOptions = computed(() =>
  variantOptions.value.length > 1 || addOnOptions.value.length > 0
)
const hasInteraction = computed(() =>
  Boolean(props.orderMode || hasOptions.value)
)

function selectItem() {
  emit('select', props.item)
}

function addItem() {
  emit('add', orderItem.value)
}
</script>

<style scoped>
.menu-item {
  display: block;
  padding-bottom: 0.7rem;
  border-bottom: 1px solid color-mix(in srgb, var(--menu-text) 18%, transparent);
  text-align: left;
}

.menu-item__summary {
  display: grid;
  width: 100%;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: var(--menu-space-md);
  align-items: start;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
}

.menu-item__summary[role="button"] {
  cursor: pointer;
}

.menu-item__summary[role="button"]:hover h3,
.menu-item__summary[role="button"]:focus-visible h3 {
  color: var(--menu-primary);
}

.menu-item__summary[role="button"]:focus-visible {
  outline: 2px solid var(--menu-primary);
  outline-offset: 0.3rem;
}

.menu-item__summary--with-image {
  grid-template-columns: 5.5rem minmax(0, 1fr) auto;
}

.menu-item--selected {
  border-color: color-mix(in srgb, var(--menu-primary) 42%, transparent);
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

.menu-item__interaction {
  display: grid;
  gap: var(--menu-space-sm);
  padding-top: var(--menu-space-sm);
}

.menu-item__add {
  display: inline-flex;
  width: fit-content;
  min-height: 2.25rem;
  align-items: center;
  gap: var(--menu-space-xs);
  padding: 0.45rem 0.8rem;
  border: 1px solid var(--menu-primary);
  border-radius: var(--menu-radius-control);
  background: var(--menu-primary);
  color: var(--menu-bg);
  cursor: pointer;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 900;
}

.menu-item__add:hover {
  background: color-mix(in srgb, var(--menu-primary) 88%, black);
}

.menu-item__add :deep(.iconify) {
  width: 1rem;
  height: 1rem;
}

.menu-item h3,
.menu-item p {
  margin: 0;
}

.menu-item h3 {
  font-size: 1.1rem;
  font-weight: 850;
  letter-spacing: 0;
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
  .menu-item__summary--with-image {
    grid-template-columns: 4.75rem minmax(0, 1fr) auto;
    gap: var(--menu-space-sm);
  }

  .menu-item__media {
    width: 4.75rem;
    border-radius: var(--menu-radius);
  }
}
</style>
