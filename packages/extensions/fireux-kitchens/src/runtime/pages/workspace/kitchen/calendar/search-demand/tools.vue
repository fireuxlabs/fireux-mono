<template>
  <section>
    <WorkspaceKitchenResearchStageNav
      base-path="/workspace/kitchen/calendar/search-demand"
      current="tools"
    />
    <header>
      <p>Stage 3 · Coordination</p>
      <h1>No Calendar Tools</h1>
      <p>
        Calendar orders, summarises and routes authorized evidence. Mutations
        remain Tools of the capability that owns the record.
      </p>
    </header>
    <UPageGrid as="section">
      <UCard v-for="group in demand.doorwayGroups" :key="group.title">
        <template #header
          ><h2>
            {{ group.title }}
          </h2></template
        >
        <ul class="workspace-surface__grid">
          <li v-for="item in group.items" :key="item.to">
            <ULink :to="item.to">{{ item.label }}</ULink>
            <p>{{ item.question }}</p>
          </li>
        </ul>
      </UCard>
    </UPageGrid>
    <UCard as="section" variant="subtle" :ui="{ body: 'fx-card-body-stack' }">
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
        <p>KitchenAI</p>
        <p>
          {{ demand.boundary.kitchenAI }}
        </p>
      </div>
    </UCard>
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
