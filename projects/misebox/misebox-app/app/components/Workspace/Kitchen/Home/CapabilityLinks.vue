<template>
  <UPageGrid>
    <UPageCard
      v-for="capability in capabilities"
      :key="capability.to"
      :title="capability.label"
      :description="capability.description"
      :icon="capability.icon"
      :to="capability.to"
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
