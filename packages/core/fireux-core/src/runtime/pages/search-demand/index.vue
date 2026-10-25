<template>
  <UPage class="research-page">
    <UPageHeader
      :ui="{
        root: 'py-5',
        title: 'text-2xl sm:text-3xl',
        description: 'text-sm mt-2',
      }"
      title="Research evidence"
      description="Read the sources behind this Workspace plan."
    />
    <UPageBody class="mt-5 flex flex-col gap-5 space-y-0">
      <AppSearchDemandBriefNav :briefs="briefs" /><AppSearchDemandStageNav
        current="domain"
      />
      <FireStateCard
        v-if="pending"
        surface="collection"
        title="Loading research"
        loading
      />
      <FireStateCard
        v-else-if="error || !demand"
        surface="collection"
        :state="error ? 'error' : 'empty'"
        title="Research unavailable"
        description="No research could be loaded for this subject."
      />
      <template v-else>
        <section class="research-intro">
          <h2>{{ demand.domain }}</h2>
          <p class="research-reading text-sm text-muted">
            {{ demand.summary.conclusion }}
          </p>
          <p class="text-xs text-muted">
            {{ observations.length }} observations<span
              v-if="demand.research_scope"
            >
              · reviewed {{ demand.research_scope.reviewed_at }}</span
            >
          </p>
        </section>
        <details class="research-details">
          <summary>Who this research covers and its limits</summary>
          <div class="research-detail-body research-reading text-sm">
            <p><strong>Operator:</strong> {{ demand.operator }}</p>
            <p>{{ demand.description }}</p>
            <template v-if="demand.research_scope"
              ><p>
                <strong>Research audience:</strong>
                {{ demand.research_scope.audience }}
              </p>
              <p>
                {{ demand.research_scope.geography }} ·
                {{ demand.research_scope.languages.join(' · ') }}
              </p>
              <p>
                <strong>Validation limits:</strong>
                {{ demand.research_scope.limitations }}
              </p></template
            >
            <p>
              Evidence informs a proposal. It does not prove adoption or an
              implemented capability.
            </p>
          </div>
        </details>
        <label class="research-grid gap-2 max-w-lg"
          ><span class="text-sm font-medium">Find evidence</span
          ><input
            v-model="search"
            type="search"
            placeholder="Search sources, findings or places…"
            class="research-field"
        /></label>
        <p
          v-if="!observationGroups.length"
          role="status"
          class="text-sm text-muted"
        >
          No matching evidence. Try another search.
        </p>
        <div class="research-grid">
          <details
            v-for="group in observationGroups"
            :key="group.seed"
            class="research-details"
            name="research-source-group"
          >
            <summary>
              <span>{{ group.seed }}</span
              ><span class="research-pill"
                >{{ group.observations.length }}
                {{
                  group.observations.length === 1
                    ? 'observation'
                    : 'observations'
                }}</span
              >
            </summary>
            <div class="research-detail-body">
              <details
                v-for="observation in group.observations"
                :key="observationKey(observation)"
                class="research-details"
                :name="`research-observation-${group.seed}`"
              >
                <summary>
                  <span
                    >{{ observation.query
                    }}<span
                      v-if="observation.finding"
                      class="research-summary-copy block line-clamp-2"
                      >{{ observation.finding }}</span
                    ></span
                  >
                </summary>
                <div class="research-detail-body research-reading text-sm">
                  <ULink
                    v-if="observation.source_url"
                    :to="observation.source_url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="research-evidence-link"
                    >Read original source ↗</ULink
                  >
                  <p v-if="observation.finding">
                    <strong>Finding:</strong> {{ observation.finding }}
                  </p>
                  <p v-if="observation.note">{{ observation.note }}</p>
                  <p v-if="observation.limitations">
                    <strong>Limits:</strong> {{ observation.limitations }}
                  </p>
                  <p class="text-xs text-muted">
                    {{ sourceLabel(observation.source) }} ·
                    {{ observation.geography }} · {{ observation.language }} ·
                    observed {{ observation.observed_at
                    }}<span v-if="observation.published_at">
                      · published {{ observation.published_at }}</span
                    ><span v-if="observation.period">
                      · period {{ observation.period }}</span
                    >
                  </p>
                  <dl
                    v-if="observation.metrics?.length"
                    class="text-xs text-muted"
                  >
                    <div
                      v-for="metric in observation.metrics"
                      :key="metric.label"
                      class="flex gap-2"
                    >
                      <dt>{{ metric.label }}:</dt>
                      <dd>{{ metric.value }}</dd>
                    </div>
                  </dl>
                </div>
              </details>
            </div>
          </details>
        </div>
        <footer class="research-next">
          <p class="text-sm text-muted">
            Next: see the operator jobs these sources suggest.
          </p>
          <UButton
            :to="researchRoute('/search-demand/analysis')"
            trailing-icon="i-lucide-arrow-right"
            >Read operator jobs</UButton
          >
        </footer>
      </template>
    </UPageBody>
  </UPage>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAsyncData } from '#imports'
import { useAppResearchScope } from '../../app/composables/search-demand/useAppResearchScope'
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

const { demand, briefs, researchRoute } = useAppResearchScope(
  computed(() => data.value?.demand ?? null)
)
const search = ref('')
watch(demand, () => {
  search.value = ''
})
const observations = computed(() => demand.value?.observations ?? [])
const observationGroups = computed(() => {
  const groups = new Map<string, SearchDemandObservation[]>()

  for (const observation of observations.value) {
    if (
      !`${observation.query} ${observation.finding ?? ''} ${observation.note ?? ''} ${observation.geography} ${sourceLabel(observation.source)}`
        .toLocaleLowerCase()
        .includes(search.value.trim().toLocaleLowerCase())
    )
      continue
    const seed = sourceLabel(observation.source)
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
  title: 'Research evidence',
  description:
    'Define an App’s operator boundary and review its sourced research evidence.',
})
</script>

<style scoped src="../../app/components/SearchDemand/reading.css"></style>
