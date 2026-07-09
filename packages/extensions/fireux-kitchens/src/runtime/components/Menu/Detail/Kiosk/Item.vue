<template>
  <article class="kiosk-item">
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

    <button type="button" class="kiosk-item__add" @click="addItem">
      <span>Add</span>
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
  displayPrice,
  orderItem,
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
  min-height: 3rem;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 0.9rem;
  border: 0;
  background: var(--kiosk-primary, #ff7912);
  color: white;
  cursor: pointer;
  font: inherit;
  font-size: 1rem;
  font-weight: 900;
}

.kiosk-item__add strong {
  font-size: 1.05rem;
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
