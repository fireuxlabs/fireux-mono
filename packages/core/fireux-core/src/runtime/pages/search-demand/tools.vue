<template>
  <UPage class="search-demand-tools-page">
    <UPageHeader
      title="Map operator tools"
      description="Turn observed operator jobs into bounded Tool hypotheses before grouping them into capabilities."
    >
      <template #links>
        <UButton
          to="/search-demand/analysis"
          color="neutral"
          variant="outline"
          icon="i-lucide-arrow-left"
        >
          Demand map
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody>
      <AppSearchDemandStageNav current="tools" />

      <MoleculesStateCard
        v-if="pending"
        surface="collection"
        title="Loading Tool hypotheses"
        description="Reading this App’s demand-derived Tools…"
        icon="i-lucide-loader-circle"
        loading
      />
      <MoleculesStateCard
        v-else-if="error || !demand"
        surface="collection"
        :state="error ? 'error' : 'empty'"
        title="Tool hypotheses unavailable"
        description="This App does not yet have demand-derived Tool hypotheses."
        icon="i-lucide-wrench"
      />

      <template v-else>
        <UAlert
          color="neutral"
          variant="soft"
          title="Hypotheses, not implemented Tools"
          :description="demand.tools.summary"
        />

        <section class="grid divide-y divide-default">
          <article
            v-for="tool in demand.tools.tools"
            :key="tool.id"
            class="grid gap-3 py-6"
          >
            <header class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 class="text-xl font-semibold text-highlighted">
                  {{ tool.title }}
                </h2>
                <p class="text-sm text-muted">{{ tool.id }}</p>
              </div>
              <UBadge color="neutral" variant="soft">
                {{ statusLabel(tool.status) }}
              </UBadge>
            </header>
            <p><strong>Operator job:</strong> {{ tool.operator_job }}</p>
            <p><strong>Expected outcome:</strong> {{ tool.outcome }}</p>
            <p class="text-sm text-muted">
              Demand sources: {{ clusterTitles(tool.source_cluster_ids) }}
            </p>
          </article>
        </section>

        <section class="grid gap-3 py-8">
          <p>{{ demand.tools.next_step }}</p>
          <UButton
            to="/search-demand/capabilities"
            class="w-fit"
            trailing-icon="i-lucide-arrow-right"
          >
            Group Tools into capabilities
          </UButton>
        </section>
      </template>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData } from '#imports'
import type {
  AppSearchDemand,
  SearchDemandToolHypothesis,
} from '../../config/app/search-demand'

type SearchDemandResponse = { ok: true; demand: AppSearchDemand | null }

const { data, pending, error } = await useAsyncData('search-demand-tools', () =>
  $fetch<SearchDemandResponse>('/api/app/search-demand')
)
const demand = computed(() => data.value?.demand ?? null)
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
    boundary: 'Boundary',
  }[status]
}

definePageMeta({
  layout: 'default',
  title: 'Map operator tools',
  description: 'Derive bounded Tool hypotheses from observed operator demand.',
})
</script>

<style scoped>
.search-demand-tools-page {
  max-width: 64rem;
  margin-inline: auto;
}
</style>
