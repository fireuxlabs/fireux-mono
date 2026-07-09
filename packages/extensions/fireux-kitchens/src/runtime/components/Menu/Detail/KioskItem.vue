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
} from '../../../models/kitchen/menu/menu-food.model'
import { useItem } from '../../../composables/fireux/menu/detail/useItem'

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
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto auto;
  gap: 0.75rem;
  aspect-ratio: 1;
  min-width: 0;
  color: #18181b;
}

.kiosk-item h3,
.kiosk-item p {
  margin: 0;
}

.kiosk-item h3 {
  display: -webkit-box;
  overflow: hidden;
  color: #18181b;
  font-size: 1.35rem;
  font-weight: 900;
  line-height: 1.05;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.kiosk-item__media {
  display: grid;
  min-height: 0;
  overflow: hidden;
  background: #f4f4f5;
  place-items: center;
}

.kiosk-item__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.kiosk-item__media :deep(.iconify) {
  width: 3rem;
  height: 3rem;
  color: #a1a1aa;
}

.kiosk-item__description {
  display: -webkit-box;
  min-height: 2.6rem;
  overflow: hidden;
  color: #52525b;
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
</style>
