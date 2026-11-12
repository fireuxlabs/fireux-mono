<template>
  <UCard as="article" aria-label="Item Prep items preview">
    <p class="fx-type-caption">Prep items</p>
    <h3 class="fx-type-card-heading">{{ dish.name }}</h3>

    <div v-if="dish.prepItems.length" class="pagebody">
      <div v-for="item in dish.prepItems" :key="item.id">
        <span>
          <strong>{{ item.name }}</strong>
          <span>{{ item.station }}</span>
        </span>
        <UBadge color="neutral" variant="soft" size="sm">{{
          item.yield
        }}</UBadge>
      </div>
    </div>
    <p v-else class="fx-type-caption">No prep items.</p>
  </UCard>
</template>

<script setup lang="ts">
import type { ProductDemoItem } from '~/types/product-demo'

defineProps<{
  dish: ProductDemoItem
}>()
</script>
