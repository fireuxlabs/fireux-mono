<template>
  <UPageCard
    title="Recipes"
    to="/workspace/kitchen/prep/recipes"
    icon="i-lucide-book-open"
  >
    <p :role="overview.role">
      {{ overview.message }}
    </p>
    <ul v-if="overview.flags.length">
      <li v-for="flag in overview.flags" :key="flag">{{ flag }}</li>
    </ul>
  </UPageCard>
</template>
<script setup lang="ts">
import { useKitchenWorkspacePrepRecipesOverview } from './useOverview'

const { overview } = useKitchenWorkspacePrepRecipesOverview()
</script>
