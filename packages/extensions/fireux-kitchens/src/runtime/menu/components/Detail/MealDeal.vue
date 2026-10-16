<template>
  <div class="mt-4 space-y-4" data-menu-meal-deal>
    <section v-for="group in deal.groups" :key="group.id">
      <h4 class="text-sm font-semibold">
        {{ group.name }} · Choose {{ group.choose }}
      </h4>
      <ul class="mt-2 space-y-1 text-sm">
        <li
          v-for="dish in group.dishes"
          :key="dish.dishId"
          class="meal-deal-choice"
        >
          <span>{{ dish.name }}</span>
          <span>{{
            dish.supplement ? `+ ${formatPrice(dish.supplement)}` : 'Included'
          }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>
<script setup lang="ts">
import type { MenuManifestItem } from '../../models/menu-detail.model'
defineProps<{
  deal: NonNullable<MenuManifestItem['mealDeal']>
  formatPrice: (price: number) => string
}>()
</script>
<style scoped>
.meal-deal-choice {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem;
}
.meal-deal-choice span:first-child {
  overflow-wrap: anywhere;
}
.meal-deal-choice span:last-child {
  white-space: nowrap;
}
</style>
