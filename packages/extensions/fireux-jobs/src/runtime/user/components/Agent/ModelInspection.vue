<template>
  <section>
    <UCard>
      <FireDiagnosticsModel
        :title="'Agents · Model'"
        :model="agentModelRuntime"
      />
    </UCard>

    <UCard>
      <template #header>
        <div class="card__header">
          <div class="fx-card-body-stack">
            <p>Agents collection</p>
            <p>
              Inspect model drift separately from the public agents collection
              manager.
            </p>
            <FireDiagnosticsDriftToolbar
              :drift-kind="agentsDriftKind"
              :selected-field="agentsSelectedField"
              :filter-options="agentsFilterOptions"
              :copy-label="'Copy drift · Agents'"
              :copy-payload="agentsDriftCopyPayload"
              @update:drift-kind="setAgentsDriftKind"
              @update:selected-field="setAgentsSelectedField"
            />
          </div>
        </div>
      </template>

      <div class="fx-card-body-stack">
        <AgentDirectory />

        <div v-if="agentPreviewCards.length" class="fx-card-body-stack">
          <p>Preview cards</p>
          <div class="fx-card-body-stack">
            <AgentCardsSummary
              v-for="card in agentPreviewCards"
              :key="`agent-preview-${card.id}`"
              v-bind="card"
            />
          </div>
        </div>

        <div v-if="agentProfileCards.length" class="fx-card-body-stack">
          <p>Profile cards</p>
          <div class="fx-card-body-stack">
            <AgentProfile
              v-for="entry in agentProfileCards"
              :key="`agent-profile-${entry.card.id}`"
              :card="entry.card"
              :profile="entry.profile as any"
            />
          </div>
        </div>
      </div>
    </UCard>
  </section>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-20 13:29 CEST — Root profile identity cutover: inspect domain-only Agent rows and join canonical User for previews.
// Concurrent edit — 2026-07-20 17:17 CEST — Demo Data Spine pass: cull the ad-hoc Agent card fixture.
import { useDiagnosticsDriftFilter } from 'fireux-core/runtime/composables/diagnostics/useDiagnosticsDriftFilter'
import { computed } from 'vue'
import { useAgentFetch } from '../../composables/profiles/Agent/fetch/useAgentFetch'
import { useAgentInterface } from '../../composables/profiles/Agent/utils/view/useAgentInterface'
import { AgentDefaults as AgentModelRuntime } from '../../utils/profiles/Agent/agent'

defineOptions({ name: 'AgentModelInspection' })

const agentModelRuntime = { ...AgentModelRuntime }

const { coreAgents: rawCoreAgents, userById } = useAgentFetch()
const { pill: makeAgentCard } = useAgentInterface()

const agentsCollection = computed(() => rawCoreAgents.value ?? [])

const {
  driftKind: agentsDriftKind,
  setDriftKind: setAgentsDriftKind,
  selectedField: agentsSelectedField,
  setSelectedField: setAgentsSelectedField,
  filterOptions: agentsFilterOptions,
  filteredCollection: filteredAgents,
  buildDriftPayload: buildAgentsDriftPayload,
  buildCopyPayload: buildAgentsCopyPayload,
} = useDiagnosticsDriftFilter({
  collection: agentsCollection,
  runtimeModel: agentModelRuntime,
})

const filteredAgentsDriftPayload = buildAgentsDriftPayload({
  map: ({ doc, id, drift }) => {
    const card = makeAgentCard(doc as any, userById(String(id || '')))
    return {
      id,
      displayName: card?.displayName ?? id,
      drift,
    }
  },
})

const agentsDriftCopyPayload = buildAgentsCopyPayload({
  modelPath:
    'packages/extensions/fireux-jobs/src/runtime/models/profiles/Agent/Agent.model',
  itemsKey: 'agents',
  items: filteredAgentsDriftPayload,
  total: computed(() => agentsCollection.value.length),
})

const agentPreviewCards = computed(() => {
  const out: Array<NonNullable<ReturnType<typeof makeAgentCard>>> = []
  for (const item of filteredAgents.value ?? []) {
    const card = makeAgentCard(item as any, userById((item as any)?.id))
    if (!card) continue
    out.push(card)
  }
  return out
})

const agentProfileCards = computed(() => {
  const out: Array<{
    card: NonNullable<ReturnType<typeof makeAgentCard>>
    profile: unknown
  }> = []
  for (const item of filteredAgents.value ?? []) {
    const card = makeAgentCard(item as any, userById((item as any)?.id))
    if (!card) continue
    out.push({ card, profile: item })
  }
  return out
})
</script>
