<template>
  <section class="mx-auto grid w-full max-w-5xl gap-8 py-2">
    <WorkspaceKitchenResearchStageNav
      base-path="/workspace/kitchen/calendar/search-demand"
      current="tools"
    />
    <header class="grid gap-3 border-b border-default pb-8">
      <p class="m-0 text-xs font-semibold uppercase tracking-wide text-primary">
        Stage 3 · Coordination
      </p>
      <h1 class="m-0 text-3xl font-semibold text-highlighted">
        No Calendar Tools
      </h1>
      <p class="m-0 max-w-3xl text-base text-muted">
        Calendar orders, summarises and routes authorized evidence. Mutations
        remain Tools of the capability that owns the record.
      </p>
    </header>
    <section class="grid gap-4 md:grid-cols-3">
      <UCard v-for="group in demand.doorwayGroups" :key="group.title">
        <template #header
          ><h2 class="font-semibold text-highlighted">
            {{ group.title }}
          </h2></template
        >
        <ul class="grid gap-3">
          <li v-for="item in group.items" :key="item.to">
            <ULink
              :to="item.to"
              class="font-medium text-highlighted hover:text-primary"
              >{{ item.label }}</ULink
            >
            <p class="m-0 text-sm text-muted">{{ item.question }}</p>
          </li>
        </ul>
      </UCard>
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
import { kitchenCalendarSearchDemand } from '../../../../../kitchen/models/calendar-search-demand'
const demand = kitchenCalendarSearchDemand
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
