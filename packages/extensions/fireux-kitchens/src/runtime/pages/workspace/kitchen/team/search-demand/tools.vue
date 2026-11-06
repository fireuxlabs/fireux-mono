<template>
  <section class="mx-auto grid w-full max-w-5xl gap-8 py-2">
    <WorkspaceKitchenResearchStageNav
      base-path="/workspace/kitchen/team/search-demand"
      current="tools"
    />
    <header class="grid gap-3 border-b border-default pb-8">
      <p>Stage 3 · Tools</p>
      <h1>Working and proposed Team Tools</h1>
      <p class="max-w-3xl">
        Registered Tools are callable now. Research hypotheses remain visibly
        requested.
      </p>
    </header>
    <section class="workspace-surface__grid">
      <div>
        <p>Registered</p>
        <h2>Working Team Tools</h2>
      </div>
      <article
        v-for="tool in demand.liveTools"
        :key="tool.id"
        class="grid gap-3 rounded-xl border border-success/30 p-5"
      >
        <header class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p>{{ tool.id }}</p>
            <h3>
              {{
                tool.surfaces.human === false
                  ? tool.context.instruction
                  : tool.surfaces.human.label
              }}
            </h3>
          </div>
          <div class="flex gap-2">
            <UBadge color="success" variant="soft">connected</UBadge
            ><UBadge color="neutral" variant="outline">{{ tool.mode }}</UBadge>
          </div>
        </header>
        <p>{{ tool.context.outcome }}</p>
        <p>Confirmation: {{ tool.confirmation }}</p>
      </article>
    </section>
    <section class="grid gap-4 border-t border-default pt-8">
      <div>
        <p>Research response</p>
        <h2>Proposed Team Tools</h2>
      </div>
      <UCard as="article" :ui="{ body: 'fx-card-body-stack' }"
        v-for="tool in demand.proposedTools"
        :key="tool.id"
        
      >
        <header class="card__header">
          <div>
            <p>{{ tool.id }}</p>
            <h3>
              {{ tool.label }}
            </h3>
          </div>
          <div class="fx-card__chips">
            <UBadge color="neutral" variant="outline">{{ tool.layer }}</UBadge
            ><UBadge color="neutral" variant="soft">{{ tool.status }}</UBadge>
          </div>
        </header>
        <p>{{ tool.purpose }}</p>
        <p>
          <strong>Authority:</strong>
          {{ tool.authority }}
        </p>
        <p>
          <strong>Approval:</strong>
          {{ tool.approval }}
        </p>
      </UCard>
    </section>
    <section
      class="grid gap-3 rounded-xl border border-warning/40 bg-warning/5 p-5"
    >
      <p>Current scope drift</p>
      <ul class="fx-list-stack list-disc">
        <li v-for="item in demand.currentDrift" :key="item">
          {{ item }}
        </li>
      </ul>
    </section>
    <section class="grid gap-5 border-t border-default pt-8 lg:grid-cols-2">
      <div>
        <p>TeamAI</p>
        <ul class="fx-list-stack list-disc">
          <li v-for="item in demand.aiContract.teamAI" :key="item">
            {{ item }}
          </li>
        </ul>
      </div>
      <div>
        <p>KitchenAI</p>
        <ul class="fx-list-stack list-disc">
          <li v-for="item in demand.aiContract.kitchenAI" :key="item">
            {{ item }}
          </li>
        </ul>
      </div>
    </section>
  </section>
</template>
<script setup lang="ts">
import { kitchenTeamSearchDemand } from '../../../../../kitchen/models/team-search-demand'
const demand = kitchenTeamSearchDemand
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
