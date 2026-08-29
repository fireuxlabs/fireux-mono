<template>
  <WorkspaceEntityTools :tools="tools" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type {
  PropertyWorkspaceIndexDerived,
  PropertyWorkspaceIndexState,
} from 'fireux-properties/runtime/property/composables/workspace/index/usePropertyWorkspaceIndex'

const props = defineProps<{
  state: PropertyWorkspaceIndexState
  derived: PropertyWorkspaceIndexDerived
}>()

const tools = computed(() =>
  props.derived.hasSelection
    ? [
        {
          id: 'property.view',
          label: 'View Property',
          description: 'Open the primary Property.',
          icon: 'i-lucide-eye',
          to: '#workspace-entity-controls',
        },
      ]
    : []
)
</script>
