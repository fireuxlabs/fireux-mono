<template>
  <p v-if="error" role="status">Menu placements could not be loaded.</p>
  <p v-else-if="!ready" role="status">Checking saved menu placements…</p>
  <p v-else-if="!placements.length">This item has no saved menu placements.</p>
  <ul v-else aria-label="Saved menu placements" class="fx-card-body-stack">
    <li v-for="placement in placements" :key="placement.to">
      <NuxtLink :to="placement.to">
        {{ placement.name }} · {{ placement.section }}
      </NuxtLink>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenItemContext } from '../../../../../composables/items/useKitchenItemContext'
import { useItemUsage } from '../../../../../composables/items/useItemUsage'

const { storageKitchenId, itemId } = useKitchenItemContext()
const { usages, ready, error } = useItemUsage(storageKitchenId, itemId)
const placements = computed(() =>
  usages.value.filter((usage) => usage.kind === 'menu')
)
</script>
