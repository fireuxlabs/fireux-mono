<template>
  <h2 class="font-semibold">{{ card?.title || 'Details' }}</h2>
  <template v-if="card">
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
import type { useSupplierWorkspaceIndex } from '../../../composables/workspace/useSupplierWorkspaceIndex'
type Entity = ReturnType<
  typeof useSupplierWorkspaceIndex
>['collection']['value'][number]
const props = defineProps<{ entity: Entity | null }>()
const { pill } = useSupplierInterface()
const card = computed(() => pill(props.entity))
</script>
