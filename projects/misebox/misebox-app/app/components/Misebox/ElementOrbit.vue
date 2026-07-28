<template>
  <LandingCardOrbit
    :items="items"
    :data-source="dataSource"
    aria-label="Misebox card orbit"
  >
    <template #item="{ item }">
      <slot :name="item.id" />
    </template>
  </LandingCardOrbit>
</template>

<script setup lang="ts">
import type {
  LandingCardOrbitDataSource,
  LandingCardOrbitItem,
} from 'fireux-core/types/landing-card-orbit'

defineProps<{
  dataSource: LandingCardOrbitDataSource
}>()

const items = [
  {
    id: 'kitchens',
    label: 'Kitchen · Cell',
    latitude: -0.72,
  },
  {
    id: 'menu',
    label: 'Menu · Cell',
    latitude: 0.38,
  },
  {
    id: 'dish',
    label: 'Dish · Cell',
    latitude: 0.76,
  },
  {
    id: 'mise',
    label: 'Mise · Preview',
    latitude: 0.08,
  },
  {
    id: 'recipe',
    label: 'Recipe · Cell',
    latitude: -0.46,
  },
  {
    id: 'supplier-item',
    label: 'Supplier item · Cell',
    latitude: 0.58,
  },
  {
    id: 'order-item',
    label: 'Kiosk · Item',
    latitude: -0.62,
  },
  {
    id: 'supplier',
    label: 'Supplier · Cell',
    latitude: -0.04,
  },
] as const satisfies readonly LandingCardOrbitItem[]
</script>
