<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-team-search-demand-tools"
      ><template #header><WorkspaceNavbar title="Team Tools" /></template
      ><template #body
        ><section class="mx-auto grid w-full max-w-5xl gap-8 py-2">
          <WorkspaceKitchenResearchStageNav
            base-path="/workspace/kitchen/team/search-demand"
            current="tools"
          />
          <header class="grid gap-3 border-b border-default pb-8">
            <p
              class="m-0 text-xs font-semibold uppercase tracking-wide text-primary"
            >
              Stage 3 · Tools
            </p>
            <h1 class="m-0 text-3xl font-semibold text-highlighted">
              Working and proposed Team Tools
            </h1>
            <p class="m-0 max-w-3xl text-base text-muted">
              Registered Tools are callable now. Research hypotheses remain
              visibly requested.
            </p>
          </header>
          <section class="grid gap-4">
            <div>
              <p
                class="m-0 text-xs font-semibold uppercase tracking-wide text-success"
              >
                Registered
              </p>
              <h2 class="m-0 text-xl font-semibold text-highlighted">
                Working Team Tools
              </h2>
            </div>
            <article
              v-for="tool in demand.liveTools"
              :key="tool.id"
              class="grid gap-3 rounded-xl border border-success/30 p-5"
            >
              <header class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p class="m-0 text-xs text-dimmed">{{ tool.id }}</p>
                  <h3 class="m-0 text-lg font-semibold text-highlighted">
                    {{
                      tool.surfaces.human === false
                        ? tool.context.instruction
                        : tool.surfaces.human.label
                    }}
                  </h3>
                </div>
                <div class="flex gap-2">
                  <UBadge color="success" variant="soft">connected</UBadge
                  ><UBadge color="neutral" variant="outline">{{
                    tool.mode
                  }}</UBadge>
                </div>
              </header>
              <p class="m-0 text-sm text-muted">{{ tool.context.outcome }}</p>
              <p class="m-0 text-xs text-dimmed">
                Confirmation: {{ tool.confirmation }}
              </p>
            </article>
          </section>
          <section class="grid gap-4 border-t border-default pt-8">
            <div>
              <p
                class="m-0 text-xs font-semibold uppercase tracking-wide text-primary"
              >
                Research response
              </p>
              <h2 class="m-0 text-xl font-semibold text-highlighted">
                Proposed Team Tools
              </h2>
            </div>
            <article
              v-for="tool in demand.proposedTools"
              :key="tool.id"
              class="grid gap-3 rounded-xl border border-default p-5"
            >
              <header class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p class="m-0 text-xs text-dimmed">{{ tool.id }}</p>
                  <h3 class="m-0 text-lg font-semibold text-highlighted">
                    {{ tool.label }}
                  </h3>
                </div>
                <div class="flex gap-2">
                  <UBadge color="neutral" variant="outline">{{
                    tool.layer
                  }}</UBadge
                  ><UBadge color="neutral" variant="soft">{{
                    tool.status
                  }}</UBadge>
                </div>
              </header>
              <p class="m-0 text-sm text-toned">{{ tool.purpose }}</p>
              <p class="m-0 text-sm text-muted">
                <strong class="text-highlighted">Authority:</strong>
                {{ tool.authority }}
              </p>
              <p class="m-0 text-sm text-muted">
                <strong class="text-highlighted">Approval:</strong>
                {{ tool.approval }}
              </p>
            </article>
          </section>
          <section
            class="grid gap-3 rounded-xl border border-warning/40 bg-warning/5 p-5"
          >
            <p
              class="m-0 text-xs font-semibold uppercase tracking-wide text-warning"
            >
              Current scope drift
            </p>
            <ul class="fx-list-stack list-disc text-sm text-muted">
              <li v-for="item in demand.currentDrift" :key="item">
                {{ item }}
              </li>
            </ul>
          </section>
          <section
            class="grid gap-5 border-t border-default pt-8 lg:grid-cols-2"
          >
            <div>
              <p
                class="m-0 text-xs font-semibold uppercase tracking-wide text-primary"
              >
                TeamAI
              </p>
              <ul class="fx-list-stack list-disc text-sm text-muted">
                <li v-for="item in demand.aiContract.teamAI" :key="item">
                  {{ item }}
                </li>
              </ul>
            </div>
            <div>
              <p
                class="m-0 text-xs font-semibold uppercase tracking-wide text-primary"
              >
                KitchenAI
              </p>
              <ul class="fx-list-stack list-disc text-sm text-muted">
                <li v-for="item in demand.aiContract.kitchenAI" :key="item">
                  {{ item }}
                </li>
              </ul>
            </div>
          </section>
        </section></template
      ></UDashboardPanel
    >
  </div>
</template>
<script setup lang="ts">
import { kitchenTeamSearchDemand } from '../../../../../kitchen/models/team-search-demand'
const demand = kitchenTeamSearchDemand
definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
