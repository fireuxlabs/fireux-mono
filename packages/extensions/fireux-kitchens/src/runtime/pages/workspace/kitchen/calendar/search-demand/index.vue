<template>
  <section>
    <WorkspaceKitchenResearchStageNav
      base-path="/workspace/kitchen/calendar/search-demand"
      current="evidence"
    />
    <header>
      <p>Stage 1 · Evidence</p>
      <h1>
        {{ demand.question }}
      </h1>
      <p>
        {{ demand.method }}
      </p>
      <div>
        <UBadge color="neutral" variant="soft"
          >Observed {{ demand.observedAt }}</UBadge
        >
        <UBadge color="neutral" variant="soft">{{ demand.geography }}</UBadge>
      </div>
    </header>
    <section class="workspace-surface__grid">
      <UPageGrid as="div">
        <UCard v-for="group in demand.seeds" :key="group.seed" variant="subtle">
          <template #header
            ><h2>
              {{ group.seed }}
            </h2></template
          >
          <ul class="workspace-surface__grid">
            <li v-for="query in group.queries" :key="query">
              {{ query }}
            </li>
          </ul>
        </UCard>
      </UPageGrid>
    </section>
    <section>
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
      title="Aggregation demand"
      description="This evidence supports a daily coordination view—not a new record owner or specialist AI."
    />
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
