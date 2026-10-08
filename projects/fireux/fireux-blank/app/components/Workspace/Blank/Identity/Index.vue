<template>
  <section class="mx-auto grid w-full min-w-0 max-w-6xl gap-6">
    <MoleculesStateCard
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
import { useBlankIdentity } from '../../../../composables/useBlankIdentity'
const { selectedBlank, readState } = useBlankIdentity()
</script>
