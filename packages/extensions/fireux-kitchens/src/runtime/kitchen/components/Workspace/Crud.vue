<template>
  <div>
    <WorkspaceCrudToolbar
      label="Kitchen"
      :available="available"
      @create="createOpen = true"
      @read="openKitchen"
      @update="editKitchen"
    />

    <WorkspaceKitchenCrudCreate v-model:open="createOpen" :refresh="refresh" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type {
  KitchenWorkspaceIndexDerived,
  KitchenWorkspaceIndexState,
} from '../../composables/workspace/index/useKitchenWorkspaceIndex'

const props = defineProps<{
  state: KitchenWorkspaceIndexState
  derived: KitchenWorkspaceIndexDerived
  refresh: () => Promise<unknown>
}>()

const createOpen = ref(false)
const available = computed<Array<'create' | 'read' | 'update'>>(() => [
  'create',
  ...(props.derived.hasSelection ? (['read', 'update'] as const) : []),
])

async function openKitchen() {
  if (props.state.kitchen.id)
    await navigateTo(`/kitchens/${props.state.kitchen.id}`)
}

async function editKitchen() {
  if (props.state.kitchen.id) {
    await navigateTo(`/kitchens/${props.state.kitchen.id}/edit`)
  }
}
</script>
