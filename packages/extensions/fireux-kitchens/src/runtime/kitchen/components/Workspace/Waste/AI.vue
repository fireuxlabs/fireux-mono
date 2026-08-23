<template>
  <WorkspaceKitchenAI
    :agent="wasteAgent"
    agent-label="WasteAI"
    title="Work with WasteAI"
    description="The current handshake proves that KitchenAI can pass temporary context to WasteAI. It does not use live Waste evidence or make suggestions yet."
    placeholder="Ask WasteAI…"
    :context="wasteAIContext"
    :allow-file="false"
  />
</template>

<script setup lang="ts">
import { kitchenOperationAgents } from '../../../models/operation-agents'
import { wasteAIContext } from '../../../models/waste-ai'

const wasteAgent = kitchenOperationAgents.find(
  (agent) => agent.operationSlug === 'waste'
)

if (!wasteAgent) throw new Error('WasteAI is not registered.')
</script>
