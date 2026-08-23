<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-today">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Today" />
      </template>

      <template #body>
        <section class="mx-auto grid w-full max-w-5xl gap-8 py-2">
          <header class="grid gap-3 border-b border-default pb-8">
            <p class="m-0 text-xs font-semibold uppercase tracking-wide text-primary">
              Daily coordination
            </p>
            <h1 class="m-0 text-3xl font-semibold text-highlighted">
              What needs attention today?
            </h1>
            <p class="m-0 max-w-3xl text-base text-muted">
              Open the Kitchen capability that owns the work. As those capabilities gain live, time-bound records, this page can summarise them without copying their authority.
            </p>
          </header>

          <section
            v-for="group in demand.doorwayGroups"
            :key="group.title"
            class="grid gap-3"
          >
            <h2 class="m-0 text-lg font-semibold text-highlighted">
              {{ group.title }}
            </h2>
            <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <UButton
                v-for="item in group.items"
                :key="item.to"
                :to="item.to"
                color="neutral"
                variant="soft"
                class="h-auto justify-start p-4 text-left"
              >
                <span class="grid gap-1">
                  <span class="font-semibold text-highlighted">{{ item.label }}</span>
                  <span class="text-sm font-normal text-muted">{{ item.question }}</span>
                </span>
              </UButton>
            </div>
          </section>

          <WorkspaceKitchenResearchSegue
            capability="Today"
            base-path="/workspace/kitchen/today/search-demand"
          />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { kitchenTodaySearchDemand } from '../../../../kitchen/models/today-search-demand'

const demand = kitchenTodaySearchDemand

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-today',
    label: 'Today',
    group: 'Workspace',
    icon: 'i-lucide-calendar-check',
    position: 'top',
    order: 1,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
