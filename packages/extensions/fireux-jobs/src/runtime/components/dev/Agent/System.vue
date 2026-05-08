<template>
  <section class="space-y-10">
    <DevAgentDemo />

    <UCard>
      <DevModel
        :title="'Agents · Model'"
        :model="agentModelRuntime"
      />
    </UCard>

    <UCard>
      <template #header>
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-3">
            <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Agents collection
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Browse agents resolved for this runtime and filter by model drift.
            </p>
            <DevDriftToolbar
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

      <div class="space-y-6">
        <ProfilesAgentCollectionManager :collection="filteredAgents" />

        <div v-if="agentPreviewCards.length" class="space-y-3">
          <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Preview cards
          </p>
          <div class="space-y-3">
            <ProfilesAgentCardsPreview
              v-for="card in agentPreviewCards"
              :key="`agent-preview-${card.id}`"
              v-bind="card"
            />
          </div>
        </div>

        <div v-if="agentProfileCards.length" class="space-y-3">
          <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Profile cards
          </p>
          <div class="space-y-4">
            <ProfilesAgentCardsProfile
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
import { useDevDriftFilter } from 'fireux-core/runtime/composables/dev/useDevDriftFilter'
import { computed } from 'vue'
import { useAgentCollection } from '../../../composables/fireux/firestore/profiles/Agent/fetch/useAgentCollection'
import { useAgentFetch } from '../../../composables/fireux/firestore/profiles/Agent/fetch/useAgentFetch'
import { useAgentInterface } from '../../../composables/fireux/firestore/profiles/Agent/utils/view/useAgentInterface'
import { AgentModel as AgentModelRuntime } from '../../../models/profiles/Agent/Agent.model'

defineOptions({ name: 'DevAgentSystem' })

const agentModelRuntime = AgentModelRuntime

useAgentFetch()
const { coreAgents: rawCoreAgents, appAgents: rawAppAgents } = useAgentCollection()
const { pill: makeAgentCard } = useAgentInterface()

const agentsCollection = computed(() => [
  ...(rawAppAgents?.value ?? []),
  ...(rawCoreAgents.value ?? []),
])

const rawAgentsCollection = computed(() => [
  ...(rawAppAgents?.value ?? []),
  ...(rawCoreAgents.value ?? []),
])

const {
  driftKind: agentsDriftKind,
  setDriftKind: setAgentsDriftKind,
  selectedField: agentsSelectedField,
  setSelectedField: setAgentsSelectedField,
  filterOptions: agentsFilterOptions,
  filteredCollection: filteredAgents,
  buildDriftPayload: buildAgentsDriftPayload,
  buildCopyPayload: buildAgentsCopyPayload,
} = useDevDriftFilter({
  collection: agentsCollection,
  runtimeModel: agentModelRuntime,
  prepareForDrift: (entry) => {
    const { user, ...rest } = (entry as Record<string, unknown>) ?? {}
    return rest
  },
})

const filteredAgentsDriftPayload = buildAgentsDriftPayload({
  map: ({ doc, id, drift }) => {
    const card = makeAgentCard(doc as any)
    return {
      id,
      displayName: card?.displayName ?? id,
      drift,
    }
  },
})

const agentsDriftCopyPayload = buildAgentsCopyPayload({
  modelPath: 'packages/extensions/fireux-jobs/src/runtime/models/profiles/Agent/Agent.model',
  itemsKey: 'agents',
  items: filteredAgentsDriftPayload,
  total: computed(() => agentsCollection.value.length),
})

const agentPreviewCards = computed(() => {
  const out: Array<NonNullable<ReturnType<typeof makeAgentCard>>> = []
  for (const item of filteredAgents.value ?? []) {
    const card = makeAgentCard(item as any)
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
    const card = makeAgentCard(item as any)
    if (!card) continue
    out.push({ card, profile: item })
  }
  return out
})
</script>
