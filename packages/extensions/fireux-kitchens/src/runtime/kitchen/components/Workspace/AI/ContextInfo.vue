<template>
  <div>
    <UButton
      icon="i-lucide-info"
      color="neutral"
      variant="ghost"
      size="sm"
      :aria-label="`About ${agent.name}`"
      @click="open = true"
    />

    <UModal
      v-model:open="open"
      :title="`About ${agent.name}`"
      description="The information and actions available to this page's AI."
    >
      <template #body>
        <div class="workspace-surface__grid">
          <section class="workspace-surface__grid">
            <div>
              <UBadge color="neutral" variant="soft">
                {{ maturityLabel }}
              </UBadge>
              <UBadge color="neutral" variant="outline">
                Shared KitchenAI conversation
              </UBadge>
            </div>
            <p>
              {{ summary }}
            </p>
          </section>

          <section
            class="workspace-surface__grid"
            :aria-labelledby="`${agent.id}-context`"
          >
            <h3 :id="`${agent.id}-context`">Information it can use</h3>
            <ul class="workspace-surface__grid">
              <UCard
                as="li"
                v-for="provider in agent.contextProviders"
                :key="provider.id"
              >
                <span>
                  {{ contextLabel(provider.id) }}
                </span>
                <span>
                  · supplied by {{ provider.owner }}
                  {{ provider.required ? '· required' : '· when available' }}
                </span>
              </UCard>
            </ul>
          </section>

          <section
            class="workspace-surface__grid"
            :aria-labelledby="`${agent.id}-abilities`"
          >
            <h3 :id="`${agent.id}-abilities`">What it may do</h3>
            <div>
              <UBadge
                v-for="capability in agent.capabilities"
                :key="capability"
                color="neutral"
                variant="soft"
              >
                {{ capabilityLabel(capability) }}
              </UBadge>
            </div>
          </section>

          <section
            class="workspace-surface__grid"
            :aria-labelledby="`${agent.id}-tools`"
          >
            <h3 :id="`${agent.id}-tools`">Tools</h3>
            <p v-if="!tools.length">
              No tools are registered for this capability yet.
            </p>
            <ul v-else class="workspace-surface__grid">
              <UCard
                as="li"
                :ui="{ body: 'fx-card-body-stack' }"
                v-for="tool in tools"
                :key="tool.id"
              >
                <div class="card__header">
                  <span>{{ tool.label }}</span>
                  <UBadge :color="statusColor(tool.status)" variant="soft">
                    {{ statusLabel(tool.status) }}
                  </UBadge>
                </div>
                <p>{{ tool.description }}</p>
                <p>{{ tool.authority }}</p>
                <p>{{ tool.approval }}</p>
              </UCard>
            </ul>
          </section>

          <UAlert
            color="neutral"
            variant="soft"
            icon="i-lucide-shield-check"
            title="Evidence and authority"
            description="The AI may explain supplied records and propose next steps. It must not invent live facts, treat planned tools as available, or change records without the registered authority and approval."
          />
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type {
  FireuxOperationAgentCapability,
  FireuxOperationAgentDefinition,
  FireuxOperationAgentTool,
} from 'fireux-ai/runtime/models/agents/operation-agent'

const props = defineProps<{ agent: FireuxOperationAgentDefinition }>()
const open = ref(false)
const tools = computed(() => props.agent.toolCatalogue || [])
const maturityLabel = computed(() => {
  const labels = {
    'not-connected': 'Not connected',
    handshake: 'Capability registered',
    connected: 'Context connected',
    complete: 'Operational',
  } as const
  return labels[props.agent.maturity || 'handshake']
})
const summary = computed(() =>
  props.agent.maturity === 'connected' || props.agent.maturity === 'complete'
    ? `${props.agent.name} can receive bounded information for this capability. Tool availability is shown separately below.`
    : `${props.agent.name} is registered, but live operational information may not be connected yet.`
)

function contextLabel(id: string) {
  return id
    .split('.')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function capabilityLabel(capability: FireuxOperationAgentCapability) {
  const labels: Record<FireuxOperationAgentCapability, string> = {
    read_context: 'Read supplied information',
    summarise: 'Summarise',
    identify_gaps: 'Identify gaps',
    propose_changes: 'Propose changes',
    use_tools: 'Use approved tools',
  }
  return labels[capability]
}

function statusLabel(status: FireuxOperationAgentTool['status']) {
  return {
    requested: 'Planned',
    building: 'Being built',
    available: 'Available to people',
    'agent-ready': 'Available to AI',
  }[status]
}

function statusColor(status: FireuxOperationAgentTool['status']) {
  return status === 'agent-ready'
    ? 'success'
    : status === 'available'
      ? 'primary'
      : 'neutral'
}
</script>
