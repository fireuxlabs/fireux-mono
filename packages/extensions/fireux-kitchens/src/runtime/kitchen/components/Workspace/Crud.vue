<template>
  <WorkspaceCrudToolbar
    label="Kitchen"
    :available="available"
    @create="navigateTo('/workspace/kitchen/create')"
    @read="openKitchen"
    @update="editKitchen"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type {
  KitchenWorkspaceIndexDerived,
  KitchenWorkspaceIndexState,
} from '../../composables/workspace/index/useKitchenWorkspaceIndex'

const props = defineProps<{
  state: KitchenWorkspaceIndexState
  derived: KitchenWorkspaceIndexDerived
}>()

const available = computed<Array<'create' | 'read' | 'update'>>(() => [
  'create',
  ...(props.derived.hasSelection ? (['read', 'update'] as const) : []),
])

async function openKitchen() {
  if (props.state.kitchen.id) await navigateTo(`/kitchens/${props.state.kitchen.id}`)
}

async function editKitchen() {
  if (props.state.kitchen.id) {
    await navigateTo(`/kitchens/${props.state.kitchen.id}/edit`)
  }
}
</script>
