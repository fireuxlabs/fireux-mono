<template>
  <section class="workspace-surface">
    <UPageCard
      v-if="!propertyId"
      title="No property selected"
      description="Select a property to view its identity."
      variant="subtle"
    />

    <UPageCard
      v-else-if="!selectedProperty && status !== 'error'"
      title="Loading property identity"
      description="The selected property is being loaded."
      variant="subtle"
    />

    <UCard v-else-if="selectedProperty">
      <div class="space-y-3">
        <h2 class="text-xl font-semibold text-highlighted">
          {{ selectedProperty.identity?.name || 'Untitled property' }}
        </h2>
        <WorkspaceManagement :entity="selectedProperty" />
      </div>
    </UCard>

    <UAlert v-if="status === 'error'" title="Identity could not be loaded" color="error" />
    <UAlert v-else-if="status === 'ready'" title="Identity editing is not connected yet" color="neutral" />
  </section>
</template>

<script setup lang="ts">
import { usePropertyIdentity } from '../../../composables/usePropertyIdentity'

const { selectedProperty, propertyId, status } = usePropertyIdentity()
</script>
