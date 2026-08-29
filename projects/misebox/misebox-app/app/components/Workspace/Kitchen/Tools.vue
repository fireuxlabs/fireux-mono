<template>
  <WorkspaceEntityTools :tools="entityTools">
    <UPageCard
      v-for="tool in tools"
      :key="tool.to"
      :to="tool.to"
      :title="tool.label"
      :description="tool.description"
      :icon="tool.icon"
      class="aspect-square"
      :ui="{
        container: 'p-4 sm:p-4',
        title: 'line-clamp-2',
        description: 'line-clamp-3',
      }"
      spotlight
    />
  </WorkspaceEntityTools>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type {
  KitchenWorkspaceIndexDerived,
  KitchenWorkspaceIndexState,
} from 'fireux-kitchens/runtime/kitchen/composables/workspace/index/useKitchenWorkspaceIndex'

const props = defineProps<{
  state: KitchenWorkspaceIndexState
  derived: KitchenWorkspaceIndexDerived
}>()

const entityTools = computed(() => {
  const tools = []
  if (props.derived.hasSelection) {
    tools.push({
      id: 'kitchen.view',
      label: 'View Kitchen',
      description: 'Open the primary Kitchen.',
      icon: 'i-lucide-eye',
      to: '#workspace-entity-controls',
    })
  }
  if (props.derived.canCreate) {
    tools.push({
      id: 'kitchen.create',
      label: 'Create Kitchen',
      description: 'Create and select a Kitchen.',
      icon: 'i-lucide-plus',
      to: '#workspace-entity-controls',
    })
  }
  if (
    props.state.kitchen.id &&
    !props.state.kitchen.placeId &&
    (!props.state.kitchen.name ||
      !props.state.kitchen.tagline ||
      !props.state.kitchen.url)
  ) {
    tools.push({
      id: 'kitchen.update',
      label: 'Update Kitchen',
      description: 'Add its name, tagline and image.',
      icon: 'i-lucide-pencil',
      to: '#workspace-entity-controls',
    })
  }
  if (props.state.user.kitchens.length > 1) {
    tools.push({
      id: props.derived.canSelectMultiple
        ? 'kitchen.select-primary'
        : 'kitchen.request-primary-change',
      label: props.derived.canSelectMultiple
        ? 'Select primary Kitchen'
        : 'Request primary Kitchen change',
      description: props.derived.canSelectMultiple
        ? 'Choose the Workspace Kitchen.'
        : 'Request a primary Kitchen change.',
      icon: props.derived.canSelectMultiple
        ? 'i-lucide-list-checks'
        : 'i-lucide-send',
      to: '#workspace-entity-controls',
    })
  }
  return tools
})

const tools = [
  {
    label: 'Restaurant labour-cost calculator',
    description: 'Calculate restaurant labour cost and percentage.',
    to: '/tools/restaurant-labour-cost',
    icon: 'i-lucide-calculator',
  },
  {
    label: 'QR Menu',
    description: 'Publish a Menu guests open by QR code.',
    to: '/solutions/qr-menu',
    icon: 'i-lucide-qr-code',
  },
  {
    label: 'Menu URL QR',
    description: 'Create a QR code for an existing Menu URL.',
    to: '/solutions/qr-menu-url',
    icon: 'i-lucide-link',
  },
  {
    label: 'Restaurant ordering',
    description: 'Open ordering for an available restaurant Menu.',
    to: '/tools/ordering',
    icon: 'i-lucide-shopping-bag',
  },
] as const
</script>
