<template>
  <article
    class="kiosk-item"
    :class="{
      'kiosk-item--with-options': variantOptions.length > 1 || addOnOptions.length,
    }"
  >
    <h3>{{ item.name }}</h3>

    <div class="kiosk-item__media">
      <img
        v-if="item.imageUrl"
        :src="item.imageUrl"
        :alt="item.name"
        loading="lazy"
      >
      <UIcon v-else name="i-lucide-utensils" aria-hidden="true" />
    </div>

    <p v-if="item.description" class="kiosk-item__description">
      {{ item.description }}
    </p>

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

    <button type="button" class="kiosk-item__add" @click="addItem">
      <span class="kiosk-item__add-label">
        <UIcon name="i-lucide-plus" aria-hidden="true" />
        <span>Add</span>
      </span>
      <strong v-if="displayPrice">{{ displayPrice }}</strong>
    </button>
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
.kiosk-item {
  --kiosk-item-image-scale: 2.15;
  --kiosk-item-title-size: 1.35rem;

  display: grid;
  grid-template-rows: auto minmax(0, 1.35fr) auto auto;
  gap: 0.75rem;
  aspect-ratio: 1;
  min-width: 0;
  color: white;
}

.kiosk-item--with-options {
  min-height: 34rem;
  aspect-ratio: auto;
  grid-template-rows: auto minmax(12rem, 1.35fr) auto auto auto auto;
}

.kiosk-item h3,
.kiosk-item p {
  margin: 0;
}

.kiosk-item h3 {
  display: -webkit-box;
  overflow: hidden;
  color: white;
  font-size: var(--kiosk-item-title-size);
  font-weight: 900;
  line-height: 1.05;
  text-shadow: 0 0.25rem 0.85rem rgb(0 0 0 / 42%);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.kiosk-item__media {
  position: relative;
  display: grid;
  min-height: 0;
  overflow: hidden;
  place-items: center;
}

.kiosk-item__media img {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: clamp(0.35rem, 1.8%, 0.65rem);
  object-fit: contain;
  object-position: center center;
  transform: scale(var(--kiosk-item-image-scale));
}

.kiosk-item__media :deep(.iconify) {
  width: 3rem;
  height: 3rem;
  color: rgb(255 255 255 / 64%);
}

.kiosk-item__description {
  display: -webkit-box;
  min-height: 2.6rem;
  overflow: hidden;
  color: rgb(255 255 255 / 78%);
  font-size: 0.95rem;
  line-height: 1.3;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.kiosk-item__add {
  display: flex;
  min-height: 3.15rem;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.55rem 0.65rem 0.55rem 0.8rem;
  border: 1px solid color-mix(in srgb, var(--kiosk-primary) 62%, white);
  border-radius: calc(var(--ui-radius) * 3);
  background:
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--kiosk-primary) 18%, transparent),
      color-mix(in srgb, var(--kiosk-secondary) 48%, transparent)
    ),
    color-mix(in srgb, var(--kiosk-secondary) 42%, transparent);
  backdrop-filter: blur(14px);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 12%),
    0 0.65rem 1.35rem rgb(0 0 0 / 18%);
  color: white;
  cursor: pointer;
  font: inherit;
  font-size: 0.98rem;
  font-weight: 900;
  text-shadow: 0 0.2rem 0.7rem rgb(0 0 0 / 34%);
  transition:
    background 160ms ease,
    border-color 160ms ease,
    transform 160ms ease;
}

.kiosk-item__add:hover,
.kiosk-item__add:focus-visible {
  border-color: color-mix(in srgb, var(--kiosk-primary) 82%, white);
  background:
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--kiosk-primary) 28%, transparent),
      color-mix(in srgb, var(--kiosk-secondary) 52%, transparent)
    ),
    color-mix(in srgb, var(--kiosk-secondary) 48%, transparent);
  transform: translateY(-1px);
}

.kiosk-item__add:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--kiosk-primary) 76%, white);
  outline-offset: 0.22rem;
}

.kiosk-item__add-label {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: 0.45rem;
}

.kiosk-item__add-label :deep(.iconify) {
  width: 1.1rem;
  height: 1.1rem;
}

.kiosk-item__add strong {
  flex: 0 0 auto;
  padding: 0.34rem 0.48rem;
  border: 1px solid color-mix(in srgb, var(--kiosk-primary) 44%, transparent);
  border-radius: calc(var(--ui-radius) * 2);
  background: color-mix(in srgb, var(--kiosk-primary) 20%, transparent);
  font-size: 1rem;
  line-height: 1;
}

@media (max-width: 560px) {
  .kiosk-item {
    --kiosk-item-image-scale: 1.95;
    --kiosk-item-title-size: 1.2rem;

    min-height: 22rem;
    aspect-ratio: auto;
    grid-template-rows: auto 12rem auto auto;
  }
}
</style>
