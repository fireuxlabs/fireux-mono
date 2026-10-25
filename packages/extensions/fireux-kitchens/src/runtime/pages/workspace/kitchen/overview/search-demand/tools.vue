<template>
  <section class="mx-auto grid w-full max-w-5xl gap-8 py-2">
    <WorkspaceKitchenResearchStageNav
      base-path="/workspace/kitchen/overview/search-demand"
      current="tools"
    />
    <header class="grid gap-3 border-b border-default pb-8">
      <p class="m-0 text-xs font-semibold uppercase tracking-wide text-primary">
        Stage 3 · Composition
      </p>
      <h1 class="m-0 text-3xl font-semibold text-highlighted">
        No Overview Tools
      </h1>
      <p class="m-0 max-w-3xl text-base text-muted">
        Overview composes the capability map and source-labelled summaries.
        Operators continue into the owning capability to work.
      </p>
    </header>
    <section class="grid gap-4 md:grid-cols-2">
      <UCard v-for="group in demand.groups" :key="group.title"
        ><template #header
          ><h2 class="font-semibold text-highlighted">
            {{ group.title }}
          </h2></template
        >
        <div class="flex flex-wrap gap-2">
          <UBadge
            v-for="capability in group.capabilities"
            :key="capability"
            color="neutral"
            variant="soft"
            >{{ capability }}</UBadge
          >
        </div></UCard
      >
    </section>
    <section
      class="grid gap-4 rounded-xl border border-default bg-elevated/30 p-5"
    >
      <div>
        <p
          class="m-0 text-xs font-semibold uppercase tracking-wide text-primary"
        >
          Owns
        </p>
        <p class="m-0 text-sm text-muted">{{ demand.boundary.owns }}</p>
      </div>
      <div>
        <p
          class="m-0 text-xs font-semibold uppercase tracking-wide text-primary"
        >
          Does not own
        </p>
        <p class="m-0 text-sm text-muted">
          {{ demand.boundary.doesNotOwn }}
        </p>
      </div>
      <div>
        <p
          class="m-0 text-xs font-semibold uppercase tracking-wide text-primary"
        >
          Today distinction
        </p>
        <p class="m-0 text-sm text-muted">{{ demand.boundary.today }}</p>
      </div>
      <div>
        <p
          class="m-0 text-xs font-semibold uppercase tracking-wide text-primary"
        >
          KitchenAI
        </p>
        <p class="m-0 text-sm text-muted">
          {{ demand.boundary.kitchenAI }}
        </p>
      </div>
    </section>
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
