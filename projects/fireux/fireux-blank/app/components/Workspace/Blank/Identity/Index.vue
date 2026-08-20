<template>
  <section class="workspace-surface">
    <UPageCard
      v-if="!blankId"
      title="No blank selected"
      description="Select a blank to view its identity."
      variant="subtle"
    />

    <UPageCard
      v-else-if="!selectedBlank"
      title="Loading blank identity"
      description="The selected blank is being loaded."
      variant="subtle"
    />

    <UCard v-else>
      <div class="space-y-3">
        <h2 class="text-xl font-semibold text-highlighted">
          {{ selectedBlank.name || selectedBlank.slug || 'Untitled blank' }}
        </h2>
        <WorkspaceManagement :entity="selectedBlank" />
      </div>
    </UCard>

    <DevDebugPanel
      title="Blank identity"
      scope="workspace"
      object-origin="fetched"
      :objects="{ selectedBlank }"
      :derived="debug"
      :default-open="false"
    />
  </section>
</template>

<script setup lang="ts">
import { useBlankWorkspaceOverview } from '../../../../composables/fireux/workspace/blank/overview/useBlankWorkspaceOverview'

const { selectedBlank, blankId, debug } = useBlankWorkspaceOverview()
</script>
