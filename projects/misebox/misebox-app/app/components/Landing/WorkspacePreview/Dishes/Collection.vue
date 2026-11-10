<template>
  <div v-if="dishes.length" class="workspace-preview-dishes">
    <KitchenMenuItemsCardsCell
      v-for="dish in dishes"
      :id="dish.id"
      :key="dish.id"
      :title="dish.name"
      :image-url="dish.imageUrl"
      :price-label="dish.priceLabel"
      :action="Boolean(dish.spec.id)"
      @action="$emit('select', dish.id)"
    />

    <UCard as="article">
      <div>
        <span>
          <UIcon name="i-lucide-plus" />
        </span>
      </div>
      <div>
        <p class="fx-type-caption">Create dish</p>
        <UIcon name="i-lucide-arrow-right" />
      </div>
    </UCard>
  </div>

  <UAlert
    v-else-if="error"
    color="neutral"
    variant="soft"
    title="Dish preview unavailable"
    description="No Demo Kitchen data was loaded."
  />
</template>

<script setup lang="ts">
import type { ProductDemoDish } from '~/types/product-demo'

defineProps<{
  dishes: ProductDemoDish[]
  error: boolean
}>()

defineEmits<{
  (event: 'select', dishId: string): void
}>()
</script>

<style scoped>
.workspace-preview-dishes {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 2);
}
</style>
