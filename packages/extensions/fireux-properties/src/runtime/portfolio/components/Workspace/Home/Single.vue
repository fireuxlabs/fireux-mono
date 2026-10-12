<template>
  <h2 class="font-semibold">{{ card?.title || 'Details' }}</h2>
  <MoleculesStateCard
    v-if="outcome === 'pending' || outcome === 'error'"
    :loading="outcome === 'pending'"
    :state="outcome === 'error' ? 'error' : 'missing'"
    entity="Portfolio"
    kind="document"
  />
  <template v-else-if="card">
    <WorkspaceTargetCard :card="card" :show-badges="false" />
    <UButton
      to="/workspace/portfolio/identity"
      label="Open Identity"
      icon="i-lucide-arrow-right"
      variant="soft"
    />
  </template>
  <p v-else class="text-sm text-muted">
    Choose a portfolio to see its details.
  </p>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { usePortfolioInterface } from '../../../composables/firestore/utils/view/usePortfolioInterface'
import type { usePortfolioWorkspaceIndex } from '../../../composables/workspace/usePortfolioWorkspaceIndex'
type Entity = ReturnType<
  typeof usePortfolioWorkspaceIndex
>['collection']['value'][number]
const props = defineProps<{
  entity: Entity | null
  outcome: ReturnType<typeof usePortfolioWorkspaceIndex>['outcome']['value']
}>()
const { pill } = usePortfolioInterface()
const card = computed(() => {
  const identity = props.outcome === 'ready' ? pill(props.entity) : null
  return identity ? { ...identity, to: '/workspace/portfolio/identity' } : null
})
</script>
