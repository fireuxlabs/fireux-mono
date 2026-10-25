<template>
  <section class="mx-auto grid w-full max-w-5xl gap-8 py-2">
    <WorkspaceKitchenResearchStageNav
      base-path="/workspace/kitchen/overview/search-demand"
      current="analysis"
    />
    <header class="grid gap-3 border-b border-default pb-8">
      <p class="m-0 text-xs font-semibold uppercase tracking-wide text-primary">
        Stage 2 · Analysis
      </p>
      <h1 class="m-0 text-3xl font-semibold text-highlighted">
        The operator jobs behind Overview
      </h1>
      <p class="m-0 max-w-3xl text-base text-muted">
        Give operators a stable map of the Kitchen while every fact and action
        retains an explicit owner.
      </p>
    </header>
    <ol class="grid gap-4">
      <li
        v-for="(cluster, index) in demand.clusters"
        :key="cluster.id"
        class="grid gap-3 rounded-xl border border-default p-5"
      >
        <div class="flex items-start gap-3">
          <UBadge color="neutral" variant="soft">{{ index + 1 }}</UBadge>
          <div>
            <h2 class="m-0 font-semibold text-highlighted">
              {{ cluster.title }}
            </h2>
            <p class="m-0 text-sm text-toned">
              {{ cluster.operatorJob }}
            </p>
          </div>
        </div>
        <p class="m-0 text-sm text-muted">{{ cluster.interpretation }}</p>
        <p class="m-0 text-xs text-dimmed">
          Owners: {{ cluster.owners.join(' · ') }}
        </p>
      </li>
    </ol>
    <section class="grid gap-3 border-t border-default pt-8">
      <p class="m-0 text-xs font-semibold uppercase tracking-wide text-primary">
        Required record questions
      </p>
      <ul class="fx-list-stack list-disc text-sm text-muted">
        <li v-for="question in demand.recordQuestions" :key="question">
          {{ question }}
        </li>
      </ul>
    </section>
    <UAlert
      color="primary"
      variant="soft"
      title="Analysis conclusion"
      :description="demand.conclusion"
    />
    <UButton
      to="/workspace/kitchen/overview/search-demand/tools"
      trailing-icon="i-lucide-arrow-right"
      class="w-fit"
      >Review Overview boundary</UButton
    >
  </section>
</template>

<script setup lang="ts">
import { kitchenOverviewSearchDemand } from '../../../../../kitchen/models/overview-search-demand'
const demand = kitchenOverviewSearchDemand
definePageMeta({
  layout: false,
  workspacePage: true,
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
