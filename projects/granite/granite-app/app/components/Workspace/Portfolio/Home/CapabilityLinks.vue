<template>
  <UPageGrid class="grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6">
    <UPageCard
      v-for="operation in portfolioCapabilities"
      :key="operation.to"
      :title="operation.title"
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
import { portfolioCapabilities } from 'fireux-properties/runtime/portfolio/models/capabilities'
</script>
