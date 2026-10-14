<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-identity-search-demand">
      <template #header>
        <LayoutsWorkspaceNavbar title="Identity search demand" />
      </template>

      <template #body>
        <WorkspaceKitchenResearchEvidence
          capability="Identity"
          base-path="/workspace/kitchen/identity/search-demand"
          :demand="demand"
        />
        <ClientOnly>
          <DiagnosticsDebugPanel
            v-bind="debug"
            title="Identity research debug"
            class="mt-6"
          />
        </ClientOnly>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from '#imports'
import { defineDevDebugPayload } from 'fireux-core/runtime/types/dev-debug'
import { kitchenIdentitySearchDemand } from '../../../../../kitchen/models/identity-search-demand'

const demand = kitchenIdentitySearchDemand
const route = useRoute()
const debug = computed(() =>
  defineDevDebugPayload({
    objectOrigin: 'passed',
    objects: { demand },
    derived: {
      route: route.path,
      source: 'authored Identity research',
      view: 'evidence',
      outcome: 'ready',
      clusters: demand.clusters.length,
      records: demand.records.length,
      toolHypotheses: demand.toolHypotheses.length,
    },
  })
)

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
