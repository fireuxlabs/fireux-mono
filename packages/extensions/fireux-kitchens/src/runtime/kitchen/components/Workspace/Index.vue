<template>
  <section
    id="workspace-entity-controls"
    class="flex items-center gap-2"
    aria-label="Kitchen controls"
  >
    <WorkspaceKitchenSelector
      v-if="state.kitchen.id || derived.canSelectMultiple"
      :kitchen="state.kitchen"
      :can-select-multiple="derived.canSelectMultiple"
      :has-multiple-kitchens="state.user.kitchens.length > 1"
      :refresh="refresh"
    />
    <WorkspaceKitchenCreate
      v-if="incompleteKitchen"
      :kitchen="state.kitchen"
      :refresh="refresh"
    />
    <WorkspaceKitchenCreate v-else-if="derived.canCreate" :refresh="refresh" />
  </section>
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
  refresh: () => Promise<unknown>
}>()

const incompleteKitchen = computed(
  () =>
    Boolean(props.state.kitchen.id) &&
    !props.state.kitchen.placeId &&
    (!props.state.kitchen.name ||
      !props.state.kitchen.tagline ||
      !props.state.kitchen.url)
)
</script>
