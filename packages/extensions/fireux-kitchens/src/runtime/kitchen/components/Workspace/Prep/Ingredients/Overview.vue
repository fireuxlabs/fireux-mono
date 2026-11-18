<template>
  <UPageCard
    title="Ingredients"
    to="/workspace/kitchen/prep/ingredients"
    icon="i-lucide-carrot"
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
import { useKitchenWorkspacePrepIngredientsOverview } from './useOverview'

const { overview } = useKitchenWorkspacePrepIngredientsOverview()
</script>
