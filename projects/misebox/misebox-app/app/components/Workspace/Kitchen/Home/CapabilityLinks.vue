<template>
  <UPageGrid>
    <UPageCard
      v-for="capability in capabilities"
      :key="capability.to"
      :title="capability.title"
      :description="capability.description"
      :icon="capability.icon"
      :to="capability.to"
      spotlight
    />
  </UPageGrid>
</template>

<script setup lang="ts">
import { kitchenCapabilityLinks as capabilities } from '~/content/landing'
</script>
