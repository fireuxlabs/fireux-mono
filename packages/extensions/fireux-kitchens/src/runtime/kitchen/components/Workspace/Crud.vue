<template>
  <div>
    <WorkspaceCrudToolbar
      label="Kitchen"
      :available="available"
      @create="createOpen = true"
      @read="readOpen = true"
      @update="editKitchen"
    />

    <WorkspaceKitchenCrudCreate v-model:open="createOpen" :refresh="refresh" />
    <WorkspaceKitchenCrudRead v-model:open="readOpen" :state="state" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import WorkspaceKitchenCrudRead from './Crud/Read.vue'
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
const readOpen = ref(false)
const available = computed<Array<'create' | 'read' | 'update'>>(() => [
  'create',
  ...(props.state.appUser.kitchens.length ? (['read'] as const) : []),
  ...(props.state.kitchen.id ? (['update'] as const) : []),
])

async function editKitchen() {
  if (props.state.kitchen.id) {
    await navigateTo(`/kitchens/${props.state.kitchen.id}/edit`)
  }
}
</script>
