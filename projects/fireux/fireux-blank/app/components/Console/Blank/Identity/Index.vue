<template>
  <section class="console-surface">
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
        <ConsoleAppScope :entity="selectedBlank" />
      </div>
    </UCard>

    <DevFireuxDebugPanel
      title="Blank identity"
      scope="console"
      :data="debug"
      :default-open="false"
    />
  </section>
</template>

<script setup lang="ts">
import { useBlankConsoleOverview } from '../../../../composables/fireux/console/blank/overview/useBlankConsoleOverview'

const { selectedBlank, blankId, debug } = useBlankConsoleOverview()
</script>
