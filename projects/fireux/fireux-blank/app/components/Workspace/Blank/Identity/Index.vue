<template>
  <section class="pagebody">
    <FireState
      v-if="status === 'pending' || status === 'error'"
      :outcome="status"
      entity="Blank identity"
    />
    <UAlert
      v-else-if="status !== 'ready'"
      title="Choose a Blank"
      description="Select a Blank to view its identity."
      color="neutral"
      variant="soft"
      role="status"
      aria-live="polite"
    />
    <UCard v-else-if="selectedBlank">
      <template #header
        ><h2 class="fx-type-section-title">Profile</h2></template
      >
      <div class="fx-card-body-stack">
        <h3 class="fx-type-card-heading">
          {{ selectedBlank.name || selectedBlank.slug || 'Untitled blank' }}
        </h3>
        <WorkspaceDedicatedApp :entity="selectedBlank" />
      </div>
      <template #footer
        ><p class="fx-type-caption">
          Identity editing is not connected here yet.
        </p></template
      >
    </UCard>
  </section>
</template>
<script setup lang="ts">
import { useBlankWorkspaceIdentity } from '../../../../composables/workspace/useBlankWorkspaceIdentity'
const { selectedBlank, status } = useBlankWorkspaceIdentity()
</script>
