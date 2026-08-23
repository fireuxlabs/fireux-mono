<template>
  <div class="flex min-h-full min-w-0 flex-1"><UDashboardPanel id="workspace-kitchen-receiving-search-demand-analysis">
    <template #header><LayoutsWorkspaceNavbar title="Receiving demand analysis" /></template><template #body><section class="mx-auto grid w-full max-w-5xl gap-8 py-2">
      <WorkspaceKitchenResearchStageNav base-path="/workspace/kitchen/receiving/search-demand" current="analysis" />
      <header class="grid gap-3 border-b border-default pb-8"><p class="m-0 text-xs font-semibold uppercase tracking-wide text-primary">Stage 2 · Analysis</p><h1 class="m-0 text-3xl font-semibold text-highlighted">The operator jobs behind Receiving searches</h1><p class="m-0 max-w-3xl text-base text-muted">Interpret observed language, identify required evidence, and preserve capability boundaries before proposing Tools.</p></header>
      <ol class="grid gap-4"><li v-for="(cluster, index) in demand.clusters" :key="cluster.id" class="grid gap-2 rounded-xl border border-default p-5"><div class="flex items-start gap-3"><UBadge color="neutral" variant="soft">{{ index + 1 }}</UBadge><div class="grid gap-1"><h2 class="m-0 font-semibold text-highlighted">{{ cluster.title }}</h2><p class="m-0 text-sm text-toned">{{ cluster.operatorJob }}</p></div></div><p class="m-0 text-sm text-muted">{{ cluster.interpretation }}</p><p class="m-0 text-xs text-dimmed">Evidence: {{ cluster.evidenceQueries.join(' · ') }}</p></li></ol>
      <section class="grid gap-3 border-t border-default pt-8"><p class="m-0 text-xs font-semibold uppercase tracking-wide text-primary">Required record questions</p><h2 class="m-0 text-xl font-semibold text-highlighted">What must Receiving make knowable?</h2><ul class="fx-list-stack list-disc text-sm text-muted"><li v-for="question in demand.recordQuestions" :key="question">{{ question }}</li></ul></section>
      <UAlert color="primary" variant="soft" title="Analysis conclusion" :description="demand.conclusion" /><UButton to="/workspace/kitchen/receiving/search-demand/tools" trailing-icon="i-lucide-arrow-right" class="w-fit">Review proposed Tools</UButton>
    </section></template>
  </UDashboardPanel></div>
</template>
<script setup lang="ts">
import { kitchenReceivingSearchDemand } from '../../../../../kitchen/models/receiving-search-demand'
const demand = kitchenReceivingSearchDemand
definePageMeta({ layout: 'workspace', workspaceSurface: 'browse', workspaceAccess: 'public-entry', visibility: { modules: ['fireux-kitchens'] }, requiresAuth: false, requiresSelection: false })
</script>
