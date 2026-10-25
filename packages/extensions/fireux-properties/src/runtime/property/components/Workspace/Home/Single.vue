<template>
  <h2 class="font-semibold">{{ card?.title || 'Details' }}</h2>
  <FireStateCard
    v-if="outcome === 'pending' || outcome === 'error'"
    :loading="outcome === 'pending'"
    :state="outcome === 'error' ? 'error' : 'missing'"
    entity="Property"
    kind="document"
  />
  <template v-else-if="card">
    <WorkspaceTargetCard :card="card" :show-badges="false" />
    <UButton
      to="/workspace/property/identity"
      label="Open Identity"
      icon="i-lucide-arrow-right"
      variant="soft"
    />
  </template>
  <p v-else class="text-sm text-muted">Choose a property to see its details.</p>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { usePropertyInterface } from '../../../composables/firestore/utils/view/usePropertyInterface'
import type { usePropertyWorkspace } from '../../../composables/workspace/usePropertyWorkspace'
type Entity = ReturnType<
  typeof usePropertyWorkspace
>['collection']['value'][number]
const props = defineProps<{
  entity: Entity | null
  outcome: ReturnType<typeof usePropertyWorkspace>['outcome']['value']
}>()
const { pill } = usePropertyInterface()
const card = computed(() => {
  const identity = props.outcome === 'ready' ? pill(props.entity) : null
  return identity ? { ...identity, to: '/workspace/property/identity' } : null
})
</script>
