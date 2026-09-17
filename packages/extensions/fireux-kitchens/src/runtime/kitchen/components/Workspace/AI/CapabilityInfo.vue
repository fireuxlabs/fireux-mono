<template>
  <WorkspaceKitchenAIContextInfo :agent="agent" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenCapabilitySlug } from '../../../models/capability-tools'
import { kitchenCapabilityAgents } from '../../../models/capability-agents'

const props = defineProps<{ capability: KitchenCapabilitySlug }>()
const agent = computed(() => {
  const match = kitchenCapabilityAgents.find(
    (candidate) => candidate.operationSlug === props.capability
  )
  if (!match) {
    throw new Error(`Kitchen ${props.capability} context is not registered.`)
  }
  return match
})
</script>
