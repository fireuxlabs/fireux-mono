<template>
  <section class="mx-auto grid w-full max-w-5xl gap-8 py-2">
    <WorkspaceKitchenResearchStageNav
      base-path="/workspace/kitchen/overview/search-demand"
      current="evidence"
    />
    <header class="grid gap-3 border-b border-default pb-8">
      <p>Stage 1 · Evidence</p>
      <h1>
        {{ demand.question }}
      </h1>
      <p class="max-w-3xl">
        {{ demand.method }}
      </p>
      <div class="flex flex-wrap gap-2">
        <UBadge color="neutral" variant="soft"
          >Observed {{ demand.observedAt }}</UBadge
        ><UBadge color="neutral" variant="soft">{{ demand.geography }}</UBadge>
      </div>
    </header>
    <section class="grid gap-3 md:grid-cols-3">
      <UCard v-for="group in demand.seeds" :key="group.seed" variant="subtle">
        <template #header
          ><h2>
            {{ group.seed }}
          </h2></template
        >
        <ul class="workspace-surface__grid">
          <li v-for="query in group.queries" :key="query">{{ query }}</li>
        </ul>
      </UCard>
    </section>
    <section class="grid gap-3 border-t border-default pt-8">
      <p>Validation literature</p>
      <ul class="workspace-surface__grid">
        <li v-for="source in demand.validationSources" :key="source.url">
          <ULink :to="source.url" target="_blank">{{ source.label }}</ULink>
          <p>{{ source.note }}</p>
        </li>
      </ul>
    </section>
    <UAlert
      color="neutral"
      variant="soft"
      title="Map, not authority"
      description="Market demand supports a connected overview. It does not justify copying records or inventing universal Kitchen scores."
    />
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
