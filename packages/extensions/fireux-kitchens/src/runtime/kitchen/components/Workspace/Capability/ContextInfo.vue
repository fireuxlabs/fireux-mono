<template>
  <WorkspaceKitchenAIContextInfo :agent="agent" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenOperationCapabilitySlug } from '../../../models/operation-capabilities'
import { kitchenOperationAgents } from '../../../models/operation-agents'

const props = defineProps<{ operation: KitchenOperationCapabilitySlug }>()
const agent = computed(() => {
  const match = kitchenOperationAgents.find(
    (candidate) => candidate.operationSlug === props.operation
  )
  if (!match) {
    throw new Error(`Kitchen ${props.operation} context is not registered.`)
  }
  return match
})
</script>
