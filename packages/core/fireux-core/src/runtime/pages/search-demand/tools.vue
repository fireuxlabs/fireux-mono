<template>
  <UPage class="research-page"
    ><UPageHeader
      title="Proposed tools"
      description="Specific actions that could help operators complete their work."
    /><UPageBody class="research-page__body">
      <AppSearchDemandBriefNav :briefs="briefs" /><AppSearchDemandStageNav
        current="tools"
      />
      <FireStateCard
        v-if="pending"
        surface="collection"
        title="Loading proposed tools"
        loading
      />
      <FireStateCard
        v-else-if="error || !demand"
        surface="collection"
        :state="error ? 'error' : 'empty'"
        title="Proposed tools unavailable"
      />
      <template v-else>
        <section class="research-intro">
          <h2>{{ demand.domain }}</h2>
          <p class="research-reading research-copy research-muted">
            {{ demand.tools.summary }}
          </p>
          <p class="research-meta research-muted">
            {{ demand.tools.tools.length }} hypotheses · these are proposals,
            not shipped actions
          </p>
        </section>
        <div class="research-columns research-columns--two">
          <UFormField label="Find a tool">
            <UInput
              v-model="search"
              type="search"
              placeholder="Search names or outcomes…"
              icon="i-lucide-search"
            />
          </UFormField>
          <UFormField label="Validation stage">
            <USelect v-model="status" :items="statusOptions" />
          </UFormField>
        </div>
        <p class="research-meta research-muted" role="status">
          {{ filtered.length }} matching tools
        </p>
        <p
          v-if="!filtered.length"
          class="research-card research-copy research-muted"
        >
          No matching tools. Try another search or stage.
        </p>
        <section class="research-grid" aria-label="Proposed tools">
          <details
            v-for="tool in filtered"
            :key="tool.id"
            class="research-details"
            name="proposed-tool"
          >
            <summary>
              <span
                >{{ tool.title
                }}<span
                  class="research-summary-copy research-summary-copy--clamped"
                  >{{ tool.outcome }}</span
                ></span
              ><span class="research-pill">{{ statusLabel(tool.status) }}</span>
            </summary>
            <div class="research-detail-body research-reading research-copy">
              <p><strong>Operator job:</strong> {{ tool.operator_job }}</p>
              <p><strong>Expected outcome:</strong> {{ tool.outcome }}</p>
              <p>
                <strong>Related jobs:</strong>
                {{ clusterTitles(tool.source_cluster_ids) }}
              </p>
              <p class="research-meta research-muted">
                Research reference: {{ tool.id }}
              </p>
            </div>
          </details>
        </section>
        <footer class="research-next">
          <p class="research-reading research-copy research-muted">
            {{ demand.tools.next_step }}
          </p>
          <UButton
            :to="researchRoute('/search-demand/capabilities')"
            trailing-icon="i-lucide-arrow-right"
            >Read the capability plan</UButton
          >
        </footer>
      </template>
    </UPageBody></UPage
  >
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAsyncData } from '#imports'
import { useAppResearchScope } from '../../app/composables/search-demand/useAppResearchScope'
import type {
  AppSearchDemand,
  SearchDemandToolHypothesis,
} from '../../../config/app/search-demand'

type SearchDemandResponse = { ok: true; demand: AppSearchDemand | null }

const { data, pending, error } = await useAsyncData('search-demand-tools', () =>
  $fetch<SearchDemandResponse>('/api/app/search-demand')
)
const { demand, briefs, researchRoute } = useAppResearchScope(
  computed(() => data.value?.demand ?? null)
)
const search = ref('')
const status = ref('all')
const statusOptions = [
  { label: 'All stages', value: 'all' },
  { label: 'Test now', value: 'test-now' },
  { label: 'Research next', value: 'research-next' },
  { label: 'Later', value: 'later' },
  { label: 'Outside scope', value: 'boundary' },
]
watch(demand, () => {
  search.value = ''
  status.value = 'all'
})
const filtered = computed(() =>
  (demand.value?.tools.tools ?? []).filter(
    (tool) =>
      (status.value === 'all' || tool.status === status.value) &&
      `${tool.title} ${tool.operator_job} ${tool.outcome}`
        .toLocaleLowerCase()
        .includes(search.value.trim().toLocaleLowerCase())
  )
)
const clusters = computed(
  () =>
    new Map(
      demand.value?.analysis.clusters.map((cluster) => [
        cluster.id,
        cluster.title,
      ]) ?? []
    )
)

function clusterTitles(ids: string[]): string {
  return ids.map((id) => clusters.value.get(id) ?? id).join(' · ')
}

function statusLabel(status: SearchDemandToolHypothesis['status']): string {
  return {
    'test-now': 'Test now',
    'research-next': 'Research next',
    later: 'Later',
    boundary: 'Outside scope',
  }[status]
}

definePageMeta({
  layout: 'default',
  title: 'Proposed tools',
  description: 'Derive bounded Tool hypotheses from observed operator demand.',
})
</script>

<style scoped src="../../app/components/SearchDemand/reading.css"></style>
