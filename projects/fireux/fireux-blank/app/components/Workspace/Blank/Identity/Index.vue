<template>
  <section class="grid min-w-0 gap-6">
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
      <template #header><h2 class="font-semibold">Profile</h2></template>
      <div class="space-y-3">
        <h3 class="break-words text-xl font-semibold text-highlighted">
          {{ selectedBlank.name || selectedBlank.slug || 'Untitled blank' }}
        </h3>
        <WorkspaceDedicatedApp :entity="selectedBlank" />
      </div>
      <template #footer
        ><p class="text-sm text-muted">
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
