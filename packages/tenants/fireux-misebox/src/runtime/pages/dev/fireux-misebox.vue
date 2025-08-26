<template>
  <div>
    <UCard>
      <template #header>
        <h1>🍳 Global Chefs Collection</h1>
      </template>
      <p>Total Chefs: {{ chefs?.length || 0 }}</p>
      <FireDevJson
        :data="{ total: chefs?.length || 0, chefs }"
        title="Chefs JSON"
      />
    </UCard>
  </div>
</template>

<script setup>
import { chefConfig } from '../../models/profiles/Chef.model'

definePageMeta({
  layout: 'dev',
})

// Use the useProfile composable to fetch global chefs
const { collection: chefs } = await useProfile(chefConfig)
</script>
