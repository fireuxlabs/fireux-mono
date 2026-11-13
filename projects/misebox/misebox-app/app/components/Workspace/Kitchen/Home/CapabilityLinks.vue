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
import { workspacePreviewLinks as capabilities } from '~/content/landing'
</script>
