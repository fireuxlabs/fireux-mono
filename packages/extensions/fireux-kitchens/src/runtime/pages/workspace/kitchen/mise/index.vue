<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-mise">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Mise" />
      </template>

      <template #body>
        <section class="workspace-surface">
          <WorkspaceKitchenCapabilityTools operation="mise" />
          <WorkspaceKitchenCapabilityAI
            operation="mise"
            :suggestions="miseSuggestions"
            :action-targets="miseActionTargets"
          />
          <WorkspaceKitchenCapabilityView operation="mise" />
          <WorkspaceKitchenMise />
          <WorkspaceKitchenCapabilityGuidingLiterature operation="mise" />
          <WorkspaceKitchenResearchSegue
            capability="Mise"
            base-path="/workspace/kitchen/mise/search-demand"
          />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { buildMiseAttentionSuggestions } from '../../../../kitchen/models/operation-suggestions'
import { provideKitchenMiseWorkspace } from '../../../../kitchen/composables/workspace/Mise/useKitchenMiseWorkspace'

const miseWorkspace = provideKitchenMiseWorkspace()
const miseSuggestions = computed(() =>
  buildMiseAttentionSuggestions(miseWorkspace.miseTasks.value)
)
const miseActionTargets = computed(() =>
  miseWorkspace.miseTasks.value.flatMap((task) =>
    [
      'kitchen.mise.update-prep-task',
      'kitchen.mise.change-prep-status',
      'kitchen.mise.delete-prep-task',
    ].map((actionId) => ({
      actionId,
      targetId: task.id,
      label: String(task.title || 'Untitled Prep Task').trim(),
    }))
  )
)

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-mise',
    label: 'Mise',
    group: 'Operations',
    icon: 'i-lucide-list-checks',
    position: 'top',
    order: 21,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
