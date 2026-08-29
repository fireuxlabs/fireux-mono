<template>
  <UPageGrid class="grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6">
    <UPageCard
      v-for="operation in operations"
      :key="operation.to"
      :title="operation.label"
      :description="operation.description"
      :icon="operation.icon"
      :to="operation.to"
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
import { kitchenOperations } from 'fireux-kitchens/runtime/kitchen/models/operations'

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

const operations = featuredSlugs.flatMap((slug) => {
  const operation = kitchenOperations.find(
    (candidate) => candidate.slug === slug
  )
  return operation
    ? [
        {
          label: operation.title,
          description: operation.description,
          to: `/operations/${operation.slug}`,
          icon: operation.icon,
        },
      ]
    : []
})
</script>
