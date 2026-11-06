<template>
  <div
    v-if="dishes.length"
    class="workspace-preview-dishes max-h-[24rem] overflow-y-auto pr-1"
  >
    <KitchenFoodAndDrinkItemsCardsCell
      v-for="dish in dishes"
      :id="dish.id"
      :key="dish.id"
      :title="dish.name"
      :image-url="dish.imageUrl"
      :price-label="dish.priceLabel"
      :action="Boolean(dish.spec.id)"
      class="w-28 sm:w-32"
      @action="$emit('select', dish.id)"
    />

    <article
      class="flex aspect-[4/5] w-28 flex-col overflow-hidden rounded-xl border border-primary/20 bg-primary/5 shadow-sm sm:w-32"
    >
      <div class="flex min-h-0 flex-1 items-center justify-center">
        <span
          class="flex size-9 items-center justify-center rounded-full bg-primary text-inverted shadow-sm"
        >
          <UIcon name="i-lucide-plus" />
        </span>
      </div>
      <div
        class="flex items-center gap-2 border-t border-primary/15 bg-default/70 px-3 py-2.5"
      >
        <p class="truncate fx-type-caption">Create dish</p>
        <UIcon name="i-lucide-arrow-right" />
      </div>
    </article>
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
import type { ProductDemoDish } from './types'

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
