<template>
  <section>
    <WorkspaceKitchenResearchStageNav
      base-path="/workspace/kitchen/calendar/search-demand"
      current="analysis"
    />
    <header>
      <p>Stage 2 · Analysis</p>
      <h1>The operator jobs behind Today</h1>
      <p>
        Organise current work by time and urgency while preserving the authority
        of every child capability.
      </p>
    </header>
    <ol class="workspace-surface__grid">
      <UCard
        as="li"
        :ui="{ body: 'fx-card-body-stack' }"
        v-for="(cluster, index) in demand.clusters"
        :key="cluster.id"
      >
        <div class="fx-card__chips">
          <UBadge color="neutral" variant="soft">{{ index + 1 }}</UBadge>
          <div>
            <h2>
              {{ cluster.title }}
            </h2>
            <p>
              {{ cluster.operatorJob }}
            </p>
          </div>
        </div>
        <p>{{ cluster.interpretation }}</p>
        <p>Owners: {{ cluster.owners.join(' · ') }}</p>
      </UCard>
    </ol>
    <section>
      <p>Required record questions</p>
      <ul class="fx-list-stack">
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
      to="/workspace/kitchen/calendar/search-demand/tools"
      trailing-icon="i-lucide-arrow-right"
      >Review coordination boundary</UButton
    >
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
