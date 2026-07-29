<template>
  <UCard v-if="canWrite" aria-labelledby="create-dish-title">
    <template #header>
      <div>
        <h2 id="create-dish-title" class="text-sm font-semibold text-highlighted">
          Tools
        </h2>
        <p class="mt-1 text-sm text-muted">
          Add a Dish to this Kitchen collection.
        </p>
      </div>
    </template>

    <UButton to="/console/kitchen/dishes/create" icon="i-lucide-plus">
      Create dish
    </UButton>
  </UCard>
</template>

<script setup lang="ts">
import { useKitchenDishesWorkspace } from '../../../../../composables/fireux/console/kitchen/operations/Dishes/useKitchenDishesWorkspace'

const { canWrite } = useKitchenDishesWorkspace()
</script>
