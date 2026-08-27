<template>
  <UPage class="capability-map-page">
    <UPageHeader
      title="Define capabilities"
      description="The first complete capability map derived from the App’s demand evidence."
    >
      <template #links>
        <UButton to="/search-demand/analysis" color="neutral" variant="outline" icon="i-lucide-arrow-left">
          Demand map
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody>
      <SearchDemandStageNav current="capabilities" />

      <CollectionState
        v-if="pending"
        title="Loading capabilities"
        description="Reading this App’s capability decisions…"
        icon="i-lucide-loader-circle"
        loading
      />
      <CollectionState
        v-else-if="error || !demand"
        title="Capability map unavailable"
        description="This App does not yet have a capability map."
        icon="i-lucide-route"
      />

      <template v-else>
        <UAlert
          color="neutral"
          variant="soft"
          title="First-pass capability map"
          description="These capability boundaries organise the Workspace before deeper capability research defines their tools and detailed content."
        />

        <section class="capability-map-summary">
          <p class="capability-map-eyebrow">{{ demand.domain }}</p>
          <h2>{{ demand.capabilities.summary }}</h2>
          <p>{{ demand.description }}</p>
        </section>

        <section v-if="demand.capabilities.workspace" class="workspace-proposal">
          <header>
            <p class="capability-map-eyebrow">Proposed Workspace</p>
            <h2>Review the Kitchen menu before migration</h2>
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
                <p class="capability-map-eyebrow">{{ selectedProposal.group }}</p>
                <h3>{{ selectedProposal.label }}</h3>
              </div>
              <UBadge color="neutral" variant="soft">{{ selectedProposal.status }}</UBadge>
              <p>{{ selectedProposal.brief }}</p>
              <p v-if="selectedProposal.sources" class="workspace-proposal-evidence">
                <strong>Demand evidence:</strong> {{ selectedProposal.sources }}
              </p>
              <p v-if="selectedProposal.researchRoute" class="capability-map-route">
                Capability research: <code>{{ selectedProposal.researchRoute }}</code>
              </p>
            </section>
          </div>
        </section>

        <section class="capability-decisions">
          <header>
            <p class="capability-map-eyebrow">Decision record</p>
            <h2>Capability status and boundaries</h2>
            <p>Expand each section to review the preserved rationale and deeper research routes.</p>
          </header>

          <details v-for="group in capabilityGroups" :key="group.decision" class="capability-map-group">
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

              <p>{{ capability.rationale }}</p>
              <p v-if="capability.research_route" class="capability-map-route">
                Capability research: <code>{{ capability.research_route }}</code>
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
          :derived="{ domain: demand.domain, next_step: demand.capabilities.next_step }"
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

const { data, pending, error } = await useAsyncData('search-demand-capabilities', () =>
  $fetch<SearchDemandResponse>('/api/app/search-demand')
)
const demand = computed(() => data.value?.demand ?? null)
const selectedProposalKey = ref('Workspace:Overview')
const clusterTitles = computed(() => new Map(
  demand.value?.analysis.clusters.map(cluster => [cluster.id, cluster.title]) ?? []
))
const decisionOrder: SearchDemandCapability['decision'][] = [
  'establish-now', 'establish-later', 'context', 'derived', 'boundary',
]
const capabilityGroups = computed(() => decisionOrder.flatMap((decision) => {
  const capabilities = demand.value?.capabilities.capabilities.filter(capability => capability.decision === decision) ?? []
  return capabilities.length ? [{ decision, label: decisionLabel(decision), capabilities }] : []
}))
const workspaceProposalItems = computed(() =>
  demand.value?.capabilities.workspace?.groups.flatMap(group => [
    { label: group.label, type: 'label' as const },
    ...group.items.map(item => ({
      ...item,
      active: selectedProposalKey.value === proposalItemKey(group.label, item.label),
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
      if (proposalItemKey(group.label, item.label) !== selectedProposalKey.value) continue
      const capability = capabilities.find(candidate => candidate.id === item.capability_id)
      return {
        group: group.label,
        label: item.label,
        icon: item.icon,
        status: capability ? decisionLabel(capability.decision) : 'Workspace surface',
        brief: item.brief ?? capability?.rationale ?? 'Capability brief pending.',
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
  return ids.map(id => clusterTitles.value.get(id) ?? id).join(' · ')
}

function decisionLabel(decision: SearchDemandCapability['decision']): string {
  return {
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
  description: 'Review the first App capability map derived from search demand.',
})
</script>

<style scoped>
.capability-map-page { max-width: 64rem; margin-inline: auto; }
.capability-map-summary { display: grid; gap: calc(var(--spacing) * 3); padding-block: calc(var(--spacing) * 8); border-bottom: 1px solid var(--ui-border); }
.capability-map-summary h2 { max-width: 52rem; font-size: var(--text-2xl); font-weight: var(--font-weight-semibold); }
.capability-map-summary > p:last-child { color: var(--ui-text-muted); }
.workspace-proposal, .capability-decisions { display: grid; gap: calc(var(--spacing) * 6); padding-block: calc(var(--spacing) * 9); border-bottom: 1px solid var(--ui-border); }
.workspace-proposal > header, .capability-decisions > header { display: grid; gap: calc(var(--spacing) * 2); }
.workspace-proposal > header h2, .capability-decisions > header h2 { font-size: var(--text-2xl); font-weight: var(--font-weight-semibold); }
.workspace-proposal > header p:last-child { color: var(--ui-text-muted); }
.mini-workspace { display: grid; grid-template-columns: minmax(14rem, 18rem) minmax(0, 1fr); min-height: 32rem; overflow: hidden; border: 1px solid var(--ui-border); border-radius: var(--ui-radius); background: var(--ui-bg); }
.workspace-proposal-menu { padding: calc(var(--spacing) * 3); border-right: 1px solid var(--ui-border); background: var(--ui-bg-muted); }
.workspace-proposal-index { display: flex; min-height: 100%; flex-direction: column; align-items: start; justify-content: center; gap: calc(var(--spacing) * 4); padding: calc(var(--spacing) * 8); }
.workspace-proposal-index h3 { margin-top: calc(var(--spacing) * 1); font-size: var(--text-3xl); font-weight: var(--font-weight-semibold); }
.workspace-proposal-index > p { max-width: 42rem; color: var(--ui-text-muted); }
.workspace-proposal-icon { display: grid; width: calc(var(--spacing) * 12); height: calc(var(--spacing) * 12); place-items: center; border-radius: var(--ui-radius); background: var(--ui-primary); color: var(--ui-bg); font-size: var(--text-2xl); }
.workspace-proposal-evidence { padding-top: calc(var(--spacing) * 3); border-top: 1px solid var(--ui-border); }
.capability-decisions > header p:last-child { color: var(--ui-text-muted); }
.capability-map-group { border-bottom: 1px solid var(--ui-border); }
.capability-map-group-header { display: flex; align-items: center; justify-content: space-between; gap: calc(var(--spacing) * 4); padding-block: calc(var(--spacing) * 4); cursor: pointer; font-weight: var(--font-weight-semibold); }
.capability-map-group-header span:last-child { color: var(--ui-text-muted); font-weight: var(--font-weight-normal); }
.capability-map-list { display: grid; }
.capability-map-list > li { display: grid; gap: calc(var(--spacing) * 4); padding-block: calc(var(--spacing) * 7); border-bottom: 1px solid var(--ui-border); }
.capability-map-list header { display: flex; align-items: start; justify-content: space-between; gap: calc(var(--spacing) * 4); }
.capability-map-list h2 { font-size: var(--text-xl); font-weight: var(--font-weight-semibold); }
.capability-map-list header p, .capability-map-list > li > p { color: var(--ui-text-muted); }
.capability-map-route code { color: var(--ui-text-highlighted); }
.capability-map-next { display: grid; gap: calc(var(--spacing) * 3); margin-block: calc(var(--spacing) * 10); padding: calc(var(--spacing) * 6); border: 1px solid var(--ui-border); border-radius: var(--ui-radius); background: var(--ui-bg-muted); }
.capability-map-eyebrow { color: var(--ui-primary); font-size: var(--text-xs); font-weight: var(--font-weight-bold); letter-spacing: var(--tracking-wide); text-transform: uppercase; }
@media (max-width: 48rem) { .mini-workspace { grid-template-columns: 1fr; } .workspace-proposal-menu { border-right: 0; border-bottom: 1px solid var(--ui-border); } }
</style>
