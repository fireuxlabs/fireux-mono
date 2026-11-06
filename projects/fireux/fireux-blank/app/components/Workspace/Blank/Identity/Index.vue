<template>
  <section class="pagebody">
    <FireStateCard
      v-if="readState"
      :state="readState"
      entity="Blank identity"
      kind="document"
      :title="readState === 'empty' ? 'Choose a Blank' : undefined"
      :description="
        readState === 'empty'
          ? 'Select a Blank to view its identity.'
          : undefined
      "
    />
    <UCard v-else-if="selectedBlank">
      <template #header
        ><h2 class="fx-type-section-title">Profile</h2></template
      >
      <div class="fx-card-body-stack">
        <h3 class="break-words fx-type-card-heading">
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
const { selectedBlank, readState } = useBlankWorkspaceIdentity()
</script>
