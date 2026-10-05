<template>
  <UPage class="search-demand-page">
    <UPageHeader
      title="Understand the domain"
      description="Define the operator boundary and inspect sourced evidence in this App’s domain."
    />

    <UPageBody>
      <AppSearchDemandStageNav current="domain" />

      <MoleculesStateCard
        surface="collection"
        v-if="pending"
        title="Loading search demand"
        description="Reading this App’s research evidence…"
        icon="i-lucide-loader-circle"
        loading
      />
      <MoleculesStateCard
        surface="collection"
        v-else-if="error"
        state="error"
        title="Search demand unavailable"
        description="This App’s research evidence could not be loaded."
        icon="i-lucide-triangle-alert"
      />
      <MoleculesStateCard
        surface="collection"
        v-else-if="!demand"
        title="No demand research yet"
        description="No research evidence has been recorded for this App."
        icon="i-lucide-search"
      />

      <template v-else>
        <UAlert
          color="neutral"
          variant="soft"
          title="Evidence, not a capability decision"
          description="Review the sources and their limitations before making capability decisions."
        />

        <section class="search-demand-summary">
          <h2>{{ demand.domain }}</h2>
          <p><strong>Operator:</strong> {{ demand.operator }}</p>
          <p>{{ demand.description }}</p>
          <p>{{ observations.length }} sourced observations</p>
          <template v-if="demand.research_scope">
            <p>
              <strong>Research audience:</strong>
              {{ demand.research_scope.audience }}
            </p>
            <p>
              {{ demand.research_scope.geography }} ·
              {{ demand.research_scope.languages.join(' · ') }} · reviewed
              {{ demand.research_scope.reviewed_at }}
            </p>
            <p>
              <strong>Validation limits:</strong>
              {{ demand.research_scope.limitations }}
            </p>
          </template>
        </section>

        <div class="search-demand-groups">
          <details
            v-for="group in observationGroups"
            :key="group.seed"
            class="search-demand-group"
          >
            <summary>
              <div>
                <p class="search-demand-eyebrow">Evidence group</p>
                <h2>{{ group.seed }}</h2>
              </div>
              <span
                >{{ group.observations.length }} observation{{
                  group.observations.length === 1 ? '' : 's'
                }}</span
              >
            </summary>

            <div class="search-demand-group-body">
              <ol>
                <li
                  v-for="observation in group.observations"
                  :key="observationKey(observation)"
                >
                  <ULink
                    v-if="observation.source_url"
                    :to="observation.source_url"
                    target="_blank"
                  >
                    {{ observation.query }}
                  </ULink>
                  <span v-else>{{ observation.query }}</span>
                  <p class="search-demand-context">
                    {{ sourceLabel(observation.source) }} ·
                    {{ observation.geography }} · {{ observation.language }} ·
                    observed {{ observation.observed_at }}
                    <span v-if="observation.published_at">
                      · published {{ observation.published_at }}</span
                    >
                    <span v-if="observation.period">
                      · period {{ observation.period }}</span
                    >
                  </p>
                  <p v-if="observation.finding">{{ observation.finding }}</p>
                  <p v-if="observation.note">{{ observation.note }}</p>
                  <p v-if="observation.limitations">
                    <strong>Limits:</strong> {{ observation.limitations }}
                  </p>
                </li>
              </ol>
            </div>
          </details>
        </div>

        <section class="search-demand-next">
          <p class="search-demand-eyebrow">Next stage</p>
          <h2>Turn the observations into a demand map.</h2>
          <p>
            Group the evidence into operator jobs, state confidence and preserve
            the research gaps.
          </p>
          <div>
            <UButton
              to="/search-demand/analysis"
              trailing-icon="i-lucide-arrow-right"
            >
              Open demand map
            </UButton>
          </div>
        </section>

        <DevDebugPanel
          object-origin="fetched"
          launcher
          include-route
          title="Search demand (JSON)"
          context="Sourced App-domain research observations"
          :objects="observations"
          :derived="{
            domain: demand.domain,
            operator: demand.operator,
            description: demand.description,
          }"
          :default-open="false"
        />
      </template>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData } from '#imports'
import type {
  AppSearchDemand,
  SearchDemandObservation,
} from '../../../config/app/search-demand'

type SearchDemandResponse = {
  ok: true
  demand: AppSearchDemand | null
}

const { data, pending, error } = await useAsyncData('search-demand', () =>
  $fetch<SearchDemandResponse>('/api/app/search-demand')
)

const demand = computed(() => data.value?.demand ?? null)
const observations = computed(() => demand.value?.observations ?? [])
const observationGroups = computed(() => {
  const groups = new Map<string, SearchDemandObservation[]>()

  for (const observation of observations.value) {
    const seed = String(
      observation.metrics?.find((metric) => metric.label === 'Seed')?.value ??
        'Other evidence'
    )
    groups.set(seed, [...(groups.get(seed) ?? []), observation])
  }

  return [...groups].map(([seed, groupedObservations]) => ({
    seed,
    observations: groupedObservations,
  }))
})

function sourceLabel(source: SearchDemandObservation['source']): string {
  return {
    'google-search-console': 'Google Search Console',
    'google-trends': 'Google Trends',
    'google-autocomplete': 'Google Autocomplete',
    'live-search-results': 'Live search results',
    'official-statistics': 'Official statistics',
    'operator-survey': 'Operator survey',
    'operator-interview': 'Operator interview',
    'operator-discussion': 'Operator discussion',
    'regulatory-guidance': 'Regulatory guidance',
    'operational-guidance': 'Operational guidance',
    'product-documentation': 'Product documentation',
    'operator-case-study': 'Operator case study',
  }[source]
}

function observationKey(observation: SearchDemandObservation): string {
  return (
    observation.id ??
    `${observation.source}:${observation.query}:${observation.observed_at}`
  )
}

definePageMeta({
  layout: 'default',
  title: 'Understand the domain',
  description:
    'Define an App’s operator boundary and review its sourced research evidence.',
})
</script>

<style scoped>
.search-demand-page {
  max-width: 64rem;
  margin-inline: auto;
}
.search-demand-summary {
  display: grid;
  gap: calc(var(--spacing) * 2);
  padding-block: calc(var(--spacing) * 8);
  border-bottom: 1px solid var(--ui-border);
}
.search-demand-summary h2 {
  font-size: var(--text-xl);
  font-weight: var(--font-weight-bold);
}
.search-demand-summary p {
  color: var(--ui-text-muted);
}
.search-demand-groups {
  display: grid;
}
.search-demand-group {
  border-bottom: 1px solid var(--ui-border);
}
.search-demand-group summary {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: calc(var(--spacing) * 4);
  padding-block: calc(var(--spacing) * 5);
  cursor: pointer;
  list-style: none;
}
.search-demand-group summary::-webkit-details-marker {
  display: none;
}
.search-demand-group summary::after {
  content: '+';
  color: var(--ui-text-muted);
  font-size: var(--text-xl);
}
.search-demand-group[open] summary::after {
  content: '−';
}
.search-demand-group-body {
  display: grid;
  gap: calc(var(--spacing) * 4);
  padding-block-end: calc(var(--spacing) * 6);
}
.search-demand-group h2 {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
}
.search-demand-group summary > span,
.search-demand-context {
  margin-inline-start: auto;
  color: var(--ui-text-muted);
  font-size: var(--text-sm);
}
.search-demand-group ol {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
  gap: calc(var(--spacing) * 2) calc(var(--spacing) * 6);
  padding-inline-start: calc(var(--spacing) * 5);
  list-style: decimal;
}
.search-demand-next {
  display: grid;
  gap: calc(var(--spacing) * 4);
  margin-block: calc(var(--spacing) * 10);
  padding: calc(var(--spacing) * 6);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius);
  background: var(--ui-bg-muted);
}
.search-demand-next h2 {
  font-size: var(--text-xl);
  font-weight: var(--font-weight-semibold);
}
.search-demand-next > p {
  color: var(--ui-text-muted);
}
.search-demand-eyebrow {
  color: var(--ui-primary);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
}
</style>
