<template>
  <UPageGrid class="grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6">
    <UPageCard
      v-for="capability in capabilities"
      :key="capability.to"
      :title="capability.label"
      :description="capability.description"
      :icon="capability.icon"
      :to="capability.to"
      class="aspect-square"
      :ui="{
        container: 'p-4 sm:p-4',
        title: 'line-clamp-2',
        description: 'line-clamp-3',
      }"
      spotlight
    />
  </UPageGrid>
</template>

<script setup lang="ts">
import { kitchenCapabilities } from 'fireux-kitchens/runtime/kitchen/models/capabilities'

const featuredSlugs = [
  'menus',
  'dishes',
  'recipes',
  'mise',
  'orders',
  'finance',
  'suppliers',
  'ingredients',
] as const

const capabilities = featuredSlugs.flatMap((slug) => {
  const capability = kitchenCapabilities.find(
    (candidate) => candidate.slug === slug
  )
  return capability
    ? [
        {
          label: capability.title,
          description: capability.description,
          to: `/operations/${capability.slug}`,
          icon: capability.icon,
        },
      ]
    : []
})
</script>
