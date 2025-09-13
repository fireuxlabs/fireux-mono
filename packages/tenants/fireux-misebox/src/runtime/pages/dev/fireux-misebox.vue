<template>
  <div>
    <UCard>
      <template #header>
        <h1>🍳 Global Chefs Collection</h1>
      </template>
      <p>Total Global Chefs: {{ globalChefs?.length || 0 }}</p>
      <FireDevJson
        :data="{ total: globalChefs?.length || 0, chefs: globalChefs }"
        title="Global Chefs JSON"
      />
    </UCard>
  </div>
</template>

<script setup>
// Removed firestore mutation imports (page now read-only global)
import { chefConfig } from '../../models/profiles/Chef.model'
definePageMeta({
  layout: 'dev',
})

// Use the useProfile composable to fetch both global and local (app) chefs

const { globalCollection: globalChefs } = await useProfile(chefConfig)
</script>
