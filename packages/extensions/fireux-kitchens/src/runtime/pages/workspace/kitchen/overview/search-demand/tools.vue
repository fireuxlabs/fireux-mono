<template>
  <section class="mx-auto grid w-full max-w-5xl gap-8 py-2">
    <WorkspaceKitchenResearchStageNav
      base-path="/workspace/kitchen/overview/search-demand"
      current="tools"
    />
    <header class="grid gap-3 border-b border-default pb-8">
      <p>Stage 3 · Composition</p>
      <h1>No Overview Tools</h1>
      <p class="max-w-3xl">
        Overview composes the capability map and source-labelled summaries.
        Operators continue into the owning capability to work.
      </p>
    </header>
    <section class="grid gap-4 md:grid-cols-2">
      <UCard v-for="group in demand.groups" :key="group.title"
        ><template #header
          ><h2>
            {{ group.title }}
          </h2></template
        >
        <div class="fx-card__chips">
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
    <UCard as="section" variant="subtle" :ui="{ body: 'fx-card-body-stack' }"
      
    >
      <div>
        <p>Owns</p>
        <p>{{ demand.boundary.owns }}</p>
      </div>
      <div>
        <p>Does not own</p>
        <p>
          {{ demand.boundary.doesNotOwn }}
        </p>
      </div>
      <div>
        <p>Today distinction</p>
        <p>{{ demand.boundary.today }}</p>
      </div>
      <div>
        <p>KitchenAI</p>
        <p>
          {{ demand.boundary.kitchenAI }}
        </p>
      </div>
    </UCard>
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
