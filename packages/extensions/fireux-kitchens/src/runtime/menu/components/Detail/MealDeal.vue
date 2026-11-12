<template>
  <div data-menu-meal-deal>
    <section v-for="group in deal.groups" :key="group.id">
      <h4>{{ group.name }} · Choose {{ group.choose }}</h4>
      <ul>
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
import type { PublicMenuItem } from '../../models/menu-detail.model'
defineProps<{
  deal: NonNullable<PublicMenuItem['mealDeal']>
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
