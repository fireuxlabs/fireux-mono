<template>
  <UPageGrid as="ul" aria-label="Kitchens">
    <li v-for="card in props.cards" :key="card.to">
      <PublicKitchenCollectionCard :card="card" />
    </li>
  </UPageGrid>
  <FireDiagnosticsDebugPanel
    title="Kitchens collection surface"
    context="Passed Kitchen cards and their final shared cell projection."
    object-origin="passed"
    :objects="{ cards: props.cards }"
    :derived="{ cells }"
    launcher
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  toKitchenCollectionCell,
  type KitchenCollectionCard,
} from '../../../utils/kitchen-interface-projection'

const props = defineProps<{ cards: KitchenCollectionCard[] }>()
const cells = computed(() => props.cards.map(toKitchenCollectionCell))
</script>
