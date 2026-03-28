<template>
  <div v-if="variant === 'pill'" class="collection-grid">
    <template v-for="card in cards" :key="card.to || card.id">
      <slot name="pill" :card="card" />
    </template>
  </div>

  <div v-else class="collection-stack">
    <template v-for="card in cards" :key="card.to || card.id">
      <slot name="cell" :card="card" />
    </template>
  </div>
</template>

<script setup lang="ts">
import type { ProjectInterfaceCard } from 'fireux-core/runtime/composables/fireux/firestore/system/project/utils/view/useProjectInterface'

withDefaults(defineProps<{
  cards: ProjectInterfaceCard[]
  variant?: 'pill' | 'cell'
}>(), {
  variant: 'pill',
})
</script>
