<template>
  <div class="space-y-6">
    <UCard v-if="dishes.length">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h2 class="text-base font-semibold text-highlighted">Dishes</h2>
          <UBadge color="neutral" variant="soft">{{ dishes.length }}</UBadge>
        </div>
      </template>

      <div class="grid gap-2">
        <UButton
          v-for="dish in dishes"
          :key="dish.id"
          :to="`/console/kitchen/dishes/${encodeURIComponent(dish.id)}`"
          color="neutral"
          variant="ghost"
          block
          trailing-icon="i-lucide-arrow-right"
        >
          <span class="truncate">{{ dish.name || dish.id }}</span>
        </UButton>
      </div>
    </UCard>

    <DevJson
      title="Kitchen dishes debug"
      context="Kitchen dishes console · /console/kitchen/dishes"
      :data="dishDebug"
      :default-open="false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenConsoleDishes } from '../../../../../composables/fireux/console/kitchen/operations/Dishes/useKitchenConsoleDishes'

const { dishes, debug } = useKitchenConsoleDishes()

const dishDebug = computed(() => ({
  objects: {
    dishes: dishes.value.map((dish) => ({
      id: dish.id,
      name: dish.name,
      hasDescription: Boolean(String(dish.description || '').trim()),
      kitchenId: dish.kitchen_id,
    })),
  },
  derived: debug.value,
}))
</script>
