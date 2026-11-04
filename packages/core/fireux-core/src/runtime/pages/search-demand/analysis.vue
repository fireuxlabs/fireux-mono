<template>
  <UPage class="research-page"
    ><UPageHeader
      title="Operator jobs"
      description="What people need to accomplish, and what the evidence tells us."
    /><UPageBody class="research-page__body">
      <AppSearchDemandBriefNav :briefs="briefs" /><AppSearchDemandStageNav
        current="analysis"
      />
      <FireStateCard
        v-if="pending"
        surface="collection"
        title="Loading operator jobs"
        loading
      />
      <FireStateCard
        v-else-if="error || !demand"
        surface="collection"
        :state="error ? 'error' : 'empty'"
        title="Operator jobs unavailable"
      />
      <template v-else>
        <section class="research-intro">
          <h2>{{ demand.domain }}</h2>
          <p class="research-reading research-copy research-muted">
            {{ demand.analysis.summary }}
          </p>
          <p class="research-meta research-muted">
            {{ demand.analysis.clusters.length }} jobs to explore ·
            interpretations of research
          </p>
        </section>
        <details class="research-details">
          <summary>Overall findings and scope</summary>
          <div class="research-detail-body research-reading research-copy">
            <p>{{ demand.summary.conclusion }}</p>
            <ul>
              <li v-for="finding in demand.summary.findings" :key="finding">
                {{ finding }}
              </li>
            </ul>
            <p><strong>Operator:</strong> {{ demand.operator }}</p>
            <p>{{ demand.description }}</p>
          </div>
        </details>
        <section class="research-grid" aria-label="Operator jobs">
          <details
            v-for="cluster in demand.analysis.clusters"
            :key="cluster.id"
            class="research-details"
            name="operator-job"
          >
            <summary>
              <span
                >{{ cluster.title
                }}<span class="research-summary-copy">{{
                  cluster.operator_job
                }}</span></span
              ><span class="research-pill"
                >{{ cluster.confidence }} confidence</span
              >
            </summary>
            <div class="research-detail-body research-reading research-copy">
              <section>
                <h3 class="research-subheading">What we infer</h3>
                <p>{{ cluster.interpretation }}</p>
              </section>
              <section v-if="cluster.research_gap">
                <h3 class="research-subheading">Still to learn</h3>
                <p>{{ cluster.research_gap }}</p>
              </section>
              <p v-if="cluster.boundary">
                <strong>Scope:</strong> {{ cluster.boundary }}
              </p>
              <details class="research-details">
                <summary>Supporting evidence</summary>
                <div class="research-detail-body">
                  <ul v-if="cluster.source_observation_ids?.length">
                    <li v-for="id in cluster.source_observation_ids" :key="id">
                      <ULink
                        :to="observationById.get(id)?.source_url"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="research-evidence-link"
                        >{{ observationById.get(id)?.query ?? id }}</ULink
                      >
                    </li>
                  </ul>
                  <ul v-if="cluster.evidence_queries.length">
                    <li v-for="query in cluster.evidence_queries" :key="query">
                      {{ query }}
                    </li>
                  </ul>
                  <p class="research-meta research-muted">
                    Intent: {{ cluster.intents.join(' · ') }}
                  </p>
                </div>
              </details>
            </div>
          </details>
        </section>
        <footer class="research-next">
          <p class="research-reading research-copy research-muted">
            {{ demand.analysis.next_step }}
          </p>
          <UButton
            :to="researchRoute('/search-demand/tools')"
            trailing-icon="i-lucide-arrow-right"
            >Explore proposed tools</UButton
          >
        </footer>
      </template>
    </UPageBody></UPage
  >
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData } from '#imports'
import { useAppResearchScope } from '../../app/composables/search-demand/useAppResearchScope'
import type { AppSearchDemand } from '../../../config/app/search-demand'

type SearchDemandResponse = { ok: true; demand: AppSearchDemand | null }

const { data, pending, error } = await useAsyncData(
  'search-demand-analysis',
  () => $fetch<SearchDemandResponse>('/api/app/search-demand')
)
const { demand, briefs, researchRoute } = useAppResearchScope(
  computed(() => data.value?.demand ?? null)
)
const observationById = computed(
  () =>
    new Map(
      demand.value?.observations
        .filter((observation) => observation.id)
        .map((observation) => [observation.id!, observation]) ?? []
    )
)

definePageMeta({
  layout: 'default',
  title: 'Operator jobs',
  description: 'Analyse search evidence into App-domain operator jobs.',
})
</script>

<style scoped src="../../app/components/SearchDemand/reading.css"></style>
