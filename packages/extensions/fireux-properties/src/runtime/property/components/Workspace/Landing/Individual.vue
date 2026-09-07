<template>
  <h2 class="font-semibold">In focus</h2>
  <template v-if="card">
    <WorkspaceTargetCard :card="card" :show-badges="false" />
    <UButton to="/workspace/property/identity" label="Open Identity" icon="i-lucide-arrow-right" variant="soft" />
  </template>
  <p v-else class="text-sm text-muted">Choose a property to see its details.</p>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { usePropertyInterface } from '../../../composables/firestore/utils/view/usePropertyInterface'
import type { usePropertyWorkspaceIndex } from '../../../composables/workspace/index/usePropertyWorkspaceIndex'
type Entity = ReturnType<typeof usePropertyWorkspaceIndex>['collection']['value'][number]
const props = defineProps<{ entity: Entity | null }>()
const { pill } = usePropertyInterface()
const card = computed(() => pill(props.entity))
</script>
