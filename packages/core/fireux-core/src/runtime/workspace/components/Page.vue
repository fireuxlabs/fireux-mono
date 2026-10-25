<template>
  <UDashboardPanel id="workspace-page">
    <template #header>
      <WorkspaceNavbar :key="route.path" :title="title" />
    </template>
    <template #body>
      <main class="workspace-page workspace-surface">
        <WorkspaceBreadcrumbs />
        <p v-if="description" class="fx-type-caption">{{ description }}</p>
        <NuxtErrorBoundary
          :key="workspace + ':' + selectedId + ':' + route.path"
        >
          <NuxtPage />
          <template #error="{ error, clearError }">
            <UAlert
              color="error"
              variant="subtle"
              icon="i-lucide-triangle-alert"
              :title="title + ' unavailable'"
              :description="
                isDevelopment
                  ? String(error)
                  : 'This page could not be loaded. The rest of the Workspace is still available.'
              "
            >
              <template #actions
                ><UButton
                  label="Retry"
                  color="neutral"
                  variant="soft"
                  icon="i-lucide-refresh-cw"
                  @click="clearError"
              /></template>
            </UAlert>
          </template>
        </NuxtErrorBoundary>
      </main>
    </template>
  </UDashboardPanel>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from '#imports'
import { useWorkspacePageNavigation } from '../composables/useWorkspacePageNavigation'
import { useWorkspaceNav } from '../composables/useWorkspaceNav'
import { useWorkspace } from '../composables/useWorkspace'
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'
const route = useRoute()
const { title, description } = useWorkspacePageNavigation()
const { currentWorkspace: workspace } = useWorkspaceNav()
const selections = new Map(
  useFireUXConfig().workspaces.map((family) => [family, useWorkspace(family)])
)
const selectedId = computed(
  () => selections.get(workspace.value)?.selectedId.value || ''
)
const isDevelopment = import.meta.dev
</script>
