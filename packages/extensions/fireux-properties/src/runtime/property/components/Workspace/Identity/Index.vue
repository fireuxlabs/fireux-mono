<template>
  <section class="workspace-surface">
    <UPageCard
      v-if="!propertyId"
      title="No property selected"
      description="Select a property to view its identity."
      variant="subtle"
    />

    <UPageCard
      v-else-if="!selectedProperty"
      title="Loading property identity"
      description="The selected property is being loaded."
      variant="subtle"
    />

    <UCard v-else>
      <div class="space-y-3">
        <h2 class="text-xl font-semibold text-highlighted">
          {{ selectedProperty.identity?.name || 'Untitled property' }}
        </h2>
        <WorkspaceManagement :entity="selectedProperty" />
      </div>
    </UCard>

    <DevDebugPanel
      title="Property identity"
      scope="workspace"
      object-origin="fetched"
      :objects="{ selectedProperty }"
      :derived="debug"
      :default-open="false"
    />
  </section>
</template>

<script setup lang="ts">
import { usePropertyOverview } from '../../../composables/usePropertyOverview'

const { selectedProperty, propertyId, debug } = usePropertyOverview()
</script>
