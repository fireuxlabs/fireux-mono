<template>
  <UPage class="research-page"
    ><UPageHeader
      :ui="{
        root: 'py-5',
        title: 'text-2xl sm:text-3xl',
        description: 'text-sm mt-2',
      }"
      title="Proposed tools"
      description="Specific actions that could help operators complete their work."
    /><UPageBody class="mt-5 flex flex-col gap-5 space-y-0">
      <AppSearchDemandBriefNav :briefs="briefs" /><AppSearchDemandStageNav
        current="tools"
      />
      <MoleculesStateCard
        v-if="pending"
        surface="collection"
        title="Loading proposed tools"
        loading
      />
      <MoleculesStateCard
        v-else-if="error || !demand"
        surface="collection"
        :state="error ? 'error' : 'empty'"
        title="Proposed tools unavailable"
      />
      <template v-else>
        <section class="research-intro">
          <h2>{{ demand.domain }}</h2>
          <p class="research-reading text-sm text-muted">
            {{ demand.tools.summary }}
          </p>
          <p class="text-xs text-muted">
            {{ demand.tools.tools.length }} hypotheses · these are proposals,
            not shipped actions
          </p>
        </section>
        <div class="grid gap-3 sm:grid-cols-2">
          <label class="research-grid gap-2"
            ><span class="text-sm font-medium">Find a tool</span
            ><input
              v-model="search"
              type="search"
              placeholder="Search names or outcomes…"
              class="research-field" /></label
          ><label class="research-grid gap-2"
            ><span class="text-sm font-medium">Validation stage</span
            ><select v-model="status" class="research-field">
              <option value="all">All stages</option>
              <option value="test-now">Test now</option>
              <option value="research-next">Research next</option>
              <option value="later">Later</option>
              <option value="boundary">Outside scope</option>
            </select></label
          >
        </div>
        <p class="text-xs text-muted" role="status">
          {{ filtered.length }} matching tools
        </p>
        <p v-if="!filtered.length" class="research-card text-sm text-muted">
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
                }}<span class="research-summary-copy block line-clamp-2">{{
                  tool.outcome
                }}</span></span
              ><span class="research-pill">{{ statusLabel(tool.status) }}</span>
            </summary>
            <div class="research-detail-body research-reading text-sm">
              <p><strong>Operator job:</strong> {{ tool.operator_job }}</p>
              <p><strong>Expected outcome:</strong> {{ tool.outcome }}</p>
              <p>
                <strong>Related jobs:</strong>
                {{ clusterTitles(tool.source_cluster_ids) }}
              </p>
              <p class="text-xs text-muted">
                Research reference: {{ tool.id }}
              </p>
            </div>
          </details>
        </section>
        <footer class="research-next">
          <p class="text-sm text-muted research-reading">
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
