<template>
  <h2 class="font-semibold">In focus</h2>
  <template v-if="card">
    <WorkspaceTargetCard :card="card" :show-badges="false" />
    <UButton to="/workspace/portfolio/identity" label="Open Identity" icon="i-lucide-arrow-right" variant="soft" />
  </template>
  <p v-else class="text-sm text-muted">Choose a portfolio to see its details.</p>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { usePortfolioInterface } from '../../../composables/firestore/utils/view/usePortfolioInterface'
import type { usePortfolioWorkspaceIndex } from '../../../composables/workspace/index/usePortfolioWorkspaceIndex'
type Entity = ReturnType<typeof usePortfolioWorkspaceIndex>['collection']['value'][number]
const props = defineProps<{ entity: Entity | null }>()
const { pill } = usePortfolioInterface()
const card = computed(() => pill(props.entity))
</script>
