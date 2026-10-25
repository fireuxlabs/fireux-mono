<template>
  <h2 class="font-semibold">{{ card?.title || 'Details' }}</h2>
  <FireStateCard
    v-if="outcome === 'pending' || outcome === 'error'"
    :loading="outcome === 'pending'"
    :state="outcome === 'error' ? 'error' : 'empty'"
    entity="Supplier"
    kind="document"
  />
  <template v-else-if="card">
    <WorkspaceTargetCard :card="card" :show-badges="false" />
    <UButton
      to="/workspace/supplier/identity"
      label="Open Identity"
      icon="i-lucide-arrow-right"
      variant="soft"
    />
  </template>
  <p v-else class="text-sm text-muted">Choose a supplier to see its details.</p>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useSupplierInterface } from '../../../composables/firestore/utils/view/useSupplierInterface'
import type { useSupplierWorkspace } from '../../../composables/workspace/useSupplierWorkspace'
type Entity = ReturnType<
  typeof useSupplierWorkspace
>['collection']['value'][number]
const props = defineProps<{
  entity: Entity | null
  outcome: ReturnType<typeof useSupplierWorkspace>['outcome']['value']
}>()
const { pill } = useSupplierInterface()
const card = computed(() => {
  const identity = props.outcome === 'ready' ? pill(props.entity) : null
  return identity ? { ...identity, to: '/workspace/supplier/identity' } : null
})
</script>
