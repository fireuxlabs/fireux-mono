<template>
  <UPageGrid>
    <UPageCard
      v-for="operation in portfolioCapabilities"
      :key="operation.to"
      :title="operation.title"
      :description="operation.description"
      :icon="operation.icon"
      :to="operation.to"
      spotlight
    />
  </UPageGrid>
</template>

<script setup lang="ts">
import { portfolioCapabilities } from 'fireux-properties/runtime/portfolio/models/capabilities'
</script>
