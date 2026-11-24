<template>
  <section>
    <h1 v-if="kitchen">{{ kitchen.name }}</h1>
    <p v-else-if="outcome === 'pending'" role="status">Loading Kitchen…</p>
    <p v-else-if="outcome === 'denied'">
      You don’t have access to this Kitchen.
    </p>
    <p v-else-if="outcome === 'missing'">This Kitchen could not be found.</p>
    <p v-else role="alert">Unable to load this Kitchen.</p>
  </section>
</template>

<script setup lang="ts">
import { useAuthorizedKitchenRead } from 'fireux-kitchens/runtime/kitchen/composables/useAuthorizedKitchenRead'

const route = useRoute()
const { kitchen, outcome } = useAuthorizedKitchenRead(() =>
  typeof route.params.kitchenId === 'string' ? route.params.kitchenId : ''
)
</script>
