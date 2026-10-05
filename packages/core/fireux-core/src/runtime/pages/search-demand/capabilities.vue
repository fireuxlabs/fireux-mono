<template>
  <UPage class="capability-map-page">
    <UPageHeader
      title="Define capabilities"
      description="The first complete capability map derived from the App’s demand evidence."
    >
      <template #links>
        <UButton
          to="/search-demand/tools"
          color="neutral"
          variant="outline"
          icon="i-lucide-arrow-left"
        >
          Tool hypotheses
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody>
      <AppSearchDemandStageNav current="capabilities" />

      <MoleculesStateCard
        surface="collection"
        v-if="pending"
        title="Loading capabilities"
        description="Reading this App’s capability decisions…"
        icon="i-lucide-loader-circle"
        loading
      />
      <MoleculesStateCard
        surface="collection"
        v-else-if="error || !demand"
        :state="error ? 'error' : 'empty'"
        title="Capability map unavailable"
        description="This App does not yet have a capability map."
        icon="i-lucide-route"
      />

      <template v-else>
        <UAlert
          color="neutral"
          variant="soft"
          title="First-pass capability map"
          description="These capability boundaries group evidence-backed Tool hypotheses without claiming that every Tool is implemented."
        />

        <section class="capability-map-summary">
          <p class="capability-map-eyebrow">{{ demand.domain }}</p>
          <h2>{{ demand.capabilities.summary }}</h2>
          <p>{{ demand.description }}</p>
        </section>

        <section
          v-if="demand.capabilities.workspace"
          class="workspace-proposal"
        >
          <header>
            <p class="capability-map-eyebrow">Proposed Workspace</p>
            <h2>Review the proposed Workspace</h2>
            <p>{{ demand.capabilities.workspace.summary }}</p>
          </header>

          <div class="mini-workspace">
            <aside class="workspace-proposal-menu">
              <UNavigationMenu
                orientation="vertical"
                :items="workspaceProposalItems"
              />
            </aside>

            <section v-if="selectedProposal" class="workspace-proposal-index">
              <div class="workspace-proposal-icon">
                <UIcon :name="selectedProposal.icon" />
              </div>
              <div>
                <p class="capability-map-eyebrow">
                  {{ selectedProposal.group }}
                </p>
                <h3>{{ selectedProposal.label }}</h3>
              </div>
              <UBadge color="neutral" variant="soft">{{
                selectedProposal.status
              }}</UBadge>
              <p>{{ selectedProposal.brief }}</p>
              <p
                v-if="selectedProposal.sources"
                class="workspace-proposal-evidence"
              >
                <strong>Demand evidence:</strong> {{ selectedProposal.sources }}
              </p>
              <p
                v-if="selectedProposal.researchRoute"
                class="capability-map-route"
              >
                Capability research:
                <code>{{ selectedProposal.researchRoute }}</code>
              </p>
            </section>
          </div>
        </section>

        <section class="capability-decisions">
          <header>
            <p class="capability-map-eyebrow">Decision record</p>
            <h2>Capability status and boundaries</h2>
            <p>
              Expand each section to review the preserved rationale and deeper
              research routes.
            </p>
          </header>

          <details
            v-for="group in capabilityGroups"
            :key="group.decision"
            class="capability-map-group"
          >
            <summary class="capability-map-group-header">
              <span>{{ group.label }}</span>
              <span>{{ group.capabilities.length }}</span>
            </summary>

            <ol class="capability-map-list">
              <li v-for="capability in group.capabilities" :key="capability.id">
                <header>
                  <div>
                    <h2>{{ capability.title }}</h2>
                    <p>{{ sourceTitles(capability.source_cluster_ids) }}</p>
                  </div>
                </header>

                <p v-if="capability.priority">
                  <strong
                    >Validation priority {{ capability.priority.rank }}:</strong
                  >
                  {{ capability.priority.rationale }}
                </p>
                <p>{{ capability.rationale }}</p>
                <template v-if="capability.assessment">
                  <p>
                    <strong>Need confidence:</strong>
                    {{ capability.assessment.market.confidence }}
                  </p>
                  <p>{{ capability.assessment.market.rationale }}</p>
                  <p>
                    <strong>Market validation gap:</strong>
                    {{ capability.assessment.market.validation_gap }}
                  </p>
                  <ul>
                    <li
                      v-for="id in capability.assessment.market
                        .source_observation_ids"
                      :key="id"
                    >
                      <ULink
                        :to="observationById.get(id)?.source_url"
                        target="_blank"
                        >{{ observationById.get(id)?.query ?? id }}</ULink
                      >
                    </li>
                  </ul>
                  <p>
                    <strong>Implementation:</strong>
                    {{ capability.assessment.implementation.status }} · assessed
                    {{ capability.assessment.implementation.assessed_at }}
                  </p>
                  <p>{{ capability.assessment.implementation.scope }}</p>
                  <details
                    v-if="
                      capability.assessment.implementation.source_paths.length
                    "
                  >
                    <summary>Implementation sources</summary>
                    <ul>
                      <li
                        v-for="path in capability.assessment.implementation
                          .source_paths"
                        :key="path"
                      >
                        <code>{{ path }}</code>
                      </li>
                    </ul>
                  </details>
                </template>
                <p v-else>
                  <strong>Implementation:</strong> Not assessed by this
                  research.
                </p>
                <p v-if="capability.source_tool_ids.length">
                  <strong>Tool hypotheses:</strong>
                  {{ toolTitles(capability.source_tool_ids) }}
                </p>
                <p
                  v-if="capability.research_route"
                  class="capability-map-route"
                >
                  Capability research:
                  <code>{{ capability.research_route }}</code>
                </p>
              </li>
            </ol>
          </details>
        </section>

        <section class="capability-map-next">
          <p class="capability-map-eyebrow">Next ignition step</p>
          <p>{{ demand.capabilities.next_step }}</p>
        </section>

        <DevDebugPanel
          object-origin="fetched"
          launcher
          include-route
          title="Capabilities (JSON)"
          context="App-owned capability decisions derived from the demand map"
          :objects="demand.capabilities.capabilities"
          :derived="{
            domain: demand.domain,
            next_step: demand.capabilities.next_step,
          }"
          :default-open="false"
        />
      </template>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAsyncData } from '#imports'
import type {
  AppSearchDemand,
  SearchDemandCapability,
} from '../../../config/app/search-demand'

type SearchDemandResponse = { ok: true; demand: AppSearchDemand | null }

const { data, pending, error } = await useAsyncData(
  'search-demand-capabilities',
  () => $fetch<SearchDemandResponse>('/api/app/search-demand')
)
const demand = computed(() => data.value?.demand ?? null)
const observationById = computed(
  () =>
    new Map(
      demand.value?.observations
        .filter((observation) => observation.id)
        .map((observation) => [observation.id!, observation]) ?? []
    )
)
const selectedProposalKey = ref('Workspace:Overview')
const clusterTitles = computed(
  () =>
    new Map(
      demand.value?.analysis.clusters.map((cluster) => [
        cluster.id,
        cluster.title,
      ]) ?? []
    )
)
const toolTitleMap = computed(
  () =>
    new Map(
      demand.value?.tools.tools.map((tool) => [tool.id, tool.title]) ?? []
    )
)
const decisionOrder: SearchDemandCapability['decision'][] = [
  'proposed',
  'establish-now',
  'establish-later',
  'context',
  'derived',
  'boundary',
]
const capabilityGroups = computed(() =>
  decisionOrder.flatMap((decision) => {
    const capabilities =
      demand.value?.capabilities.capabilities.filter(
        (capability) => capability.decision === decision
      ) ?? []
    return capabilities.length
      ? [{ decision, label: decisionLabel(decision), capabilities }]
      : []
  })
)
const workspaceProposalItems = computed(
  () =>
    demand.value?.capabilities.workspace?.groups.flatMap((group) => [
      { label: group.label, type: 'label' as const },
      ...group.items.map((item) => ({
        ...item,
        active:
          selectedProposalKey.value ===
          proposalItemKey(group.label, item.label),
        onSelect: () => {
          selectedProposalKey.value = proposalItemKey(group.label, item.label)
        },
      })),
    ]) ?? []
)
const selectedProposal = computed(() => {
  const groups = demand.value?.capabilities.workspace?.groups ?? []
  const capabilities = demand.value?.capabilities.capabilities ?? []

  for (const group of groups) {
    for (const item of group.items) {
      if (
        proposalItemKey(group.label, item.label) !== selectedProposalKey.value
      )
        continue
      const capability = capabilities.find(
        (candidate) => candidate.id === item.capability_id
      )
      return {
        group: group.label,
        label: item.label,
        icon: item.icon,
        status: capability
          ? decisionLabel(capability.decision)
          : 'Workspace surface',
        brief:
          item.brief ?? capability?.rationale ?? 'Capability brief pending.',
        sources: capability ? sourceTitles(capability.source_cluster_ids) : '',
        researchRoute: capability?.research_route,
      }
    }
  }

  return null
})

function proposalItemKey(group: string, label: string): string {
  return `${group}:${label}`
}

function sourceTitles(ids: string[]): string {
  if (!ids.length) return 'App boundary decision'
  return ids.map((id) => clusterTitles.value.get(id) ?? id).join(' · ')
}

function toolTitles(ids: string[]): string {
  return ids.map((id) => toolTitleMap.value.get(id) ?? id).join(' · ')
}

function decisionLabel(decision: SearchDemandCapability['decision']): string {
  return {
    proposed: 'Proposed for validation',
    'establish-now': 'Establish now',
    'establish-later': 'Establish later',
    context: 'Operator context',
    derived: 'Derived later',
    boundary: 'Adjacent boundaries',
  }[decision]
}

definePageMeta({
  layout: 'default',
  title: 'Define capabilities',
  description:
    'Review the first App capability map derived from search demand.',
})
</script>

<style scoped src="./capabilities.css"></style>
