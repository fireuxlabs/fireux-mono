<template>
  <UPage class="demand-map-page">
    <UPageHeader
      title="Demand map"
      description="Evidence-backed search clusters and the underlying jobs operators are trying to accomplish."
    >
      <template #links>
        <UButton to="/search-demand" color="neutral" variant="outline" icon="i-lucide-arrow-left">
          Search evidence
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody>
      <SearchDemandStageNav current="analysis" />

      <CollectionState
        v-if="pending"
        title="Loading demand map"
        description="Reading this App’s demand analysis…"
        icon="i-lucide-loader-circle"
        loading
      />
      <CollectionState
        v-else-if="error || !demand"
        title="Demand map unavailable"
        description="This App does not yet have enough analysed search evidence."
        icon="i-lucide-map"
      />

      <template v-else>
        <UAlert
          color="neutral"
          variant="soft"
          title="Analysis, not product scope"
          :description="demand.analysis.summary"
        />

        <section class="demand-map-summary">
          <h2>{{ demand.domain }}</h2>
          <p><strong>Operator:</strong> {{ demand.operator }}</p>
          <p>{{ demand.description }}</p>
          <p>{{ demand.analysis.clusters.length }} demand clusters</p>
        </section>

        <section class="demand-map-findings">
          <p class="demand-map-eyebrow">Interpretation</p>
          <h2>{{ demand.summary.conclusion }}</h2>
          <ul>
            <li v-for="finding in demand.summary.findings" :key="finding">{{ finding }}</li>
          </ul>
        </section>

        <ol class="demand-map-list">
          <li v-for="cluster in demand.analysis.clusters" :key="cluster.id">
            <header>
              <div>
                <h2>{{ cluster.title }}</h2>
                <p>{{ cluster.operator_job }}</p>
              </div>
              <UBadge color="neutral" variant="soft">{{ cluster.confidence }} confidence</UBadge>
            </header>

            <p>{{ cluster.interpretation }}</p>

            <details v-if="cluster.evidence_queries.length">
              <summary>{{ cluster.evidence_queries.length }} observed queries</summary>
              <ul>
                <li v-for="query in cluster.evidence_queries" :key="query">{{ query }}</li>
              </ul>
            </details>
            <p v-else><strong>Observed queries:</strong> No autocomplete expansion in this pass.</p>

            <p><strong>Intent:</strong> {{ cluster.intents.join(' · ') }}</p>
            <p v-if="cluster.boundary"><strong>Boundary:</strong> {{ cluster.boundary }}</p>
            <p v-if="cluster.research_gap"><strong>Research gap:</strong> {{ cluster.research_gap }}</p>
          </li>
        </ol>

        <section class="demand-map-next">
          <p class="demand-map-eyebrow">Next research step</p>
          <p>{{ demand.analysis.next_step }}</p>
          <div>
            <UButton to="/search-demand/capabilities" trailing-icon="i-lucide-arrow-right">
              Define capabilities
            </UButton>
          </div>
        </section>

        <DevDebugPanel
          object-origin="fetched"
          launcher
          include-route
          title="Demand map (JSON)"
          context="Analysis derived from the App-domain search evidence"
          :objects="demand.analysis.clusters"
          :derived="{ domain: demand.domain, operator: demand.operator, next_step: demand.analysis.next_step }"
          :default-open="false"
        />
      </template>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData } from '#imports'
import type { AppSearchDemand } from '../../../config/app/search-demand'

type SearchDemandResponse = { ok: true; demand: AppSearchDemand | null }

const { data, pending, error } = await useAsyncData('search-demand-analysis', () =>
  $fetch<SearchDemandResponse>('/api/app/search-demand')
)
const demand = computed(() => data.value?.demand ?? null)

definePageMeta({
  layout: 'default',
  title: 'Demand map',
  description: 'Analyse search evidence into App-domain operator jobs.',
})
</script>

<style scoped>
.demand-map-page { max-width: 64rem; margin-inline: auto; }
.demand-map-summary { display: grid; gap: calc(var(--spacing) * 2); padding-block: calc(var(--spacing) * 8); border-bottom: 1px solid var(--ui-border); }
.demand-map-summary h2 { font-size: var(--text-xl); font-weight: var(--font-weight-bold); }
.demand-map-summary p { color: var(--ui-text-muted); }
.demand-map-findings { display: grid; gap: calc(var(--spacing) * 4); padding-block: calc(var(--spacing) * 7); border-bottom: 1px solid var(--ui-border); }
.demand-map-findings h2 { max-width: 52rem; font-size: var(--text-2xl); font-weight: var(--font-weight-semibold); }
.demand-map-findings ul { display: grid; gap: calc(var(--spacing) * 2); padding-inline-start: calc(var(--spacing) * 5); list-style: disc; color: var(--ui-text-muted); }
.demand-map-list { display: grid; }
.demand-map-list > li { display: grid; gap: calc(var(--spacing) * 4); padding-block: calc(var(--spacing) * 7); border-bottom: 1px solid var(--ui-border); }
.demand-map-list header { display: flex; align-items: start; justify-content: space-between; gap: calc(var(--spacing) * 4); }
.demand-map-list h2 { font-size: var(--text-xl); font-weight: var(--font-weight-semibold); }
.demand-map-list header p, .demand-map-list > li > p { color: var(--ui-text-muted); }
.demand-map-list details summary { cursor: pointer; font-weight: var(--font-weight-semibold); }
.demand-map-list ul { display: grid; gap: calc(var(--spacing) * 1); padding-inline-start: calc(var(--spacing) * 5); list-style: disc; color: var(--ui-text-muted); }
.demand-map-next { display: grid; gap: calc(var(--spacing) * 3); margin-block: calc(var(--spacing) * 10); padding: calc(var(--spacing) * 6); border: 1px solid var(--ui-border); border-radius: var(--ui-radius); background: var(--ui-bg-muted); }
.demand-map-eyebrow { color: var(--ui-primary); font-size: var(--text-xs); font-weight: var(--font-weight-bold); letter-spacing: var(--tracking-wide); text-transform: uppercase; }
</style>
