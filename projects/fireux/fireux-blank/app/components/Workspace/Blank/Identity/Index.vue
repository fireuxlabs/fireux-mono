<template>
  <section class="workspace-surface">
    <UPageCard
      v-if="!blankId"
      title="No blank selected"
      description="Select a blank to view its identity."
      variant="subtle"
    />

    <UPageCard
      v-else-if="!selectedBlank && status !== 'error'"
      title="Loading blank identity"
      description="The selected blank is being loaded."
      variant="subtle"
    />

    <UCard v-else-if="selectedBlank">
      <div class="space-y-3">
        <h2 class="text-xl font-semibold text-highlighted">
          {{ selectedBlank.name || selectedBlank.slug || 'Untitled blank' }}
        </h2>
        <WorkspaceDedicatedApp :entity="selectedBlank" />
      </div>
    </UCard>

    <UAlert v-if="status === 'error'" title="Identity could not be loaded" color="error" />
    <UAlert v-else-if="status === 'ready'" title="Identity editing is not connected yet" color="neutral" />
  </section>
</template>

<script setup lang="ts">
import { useBlankIdentity } from '../../../../composables/useBlankIdentity'

const { selectedBlank, blankId, status } = useBlankIdentity()
</script>
