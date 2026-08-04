<template>
  <section class="console-surface">
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
        <ConsoleAppScope :entity="selectedProperty" />
      </div>
    </UCard>

    <DevFireuxDebugPanel
      title="Property identity"
      scope="console"
      :data="debug"
      :default-open="false"
    />
  </section>
</template>

<script setup lang="ts">
import { usePropertyConsoleOverview } from '../../../../composables/fireux/console/property/overview/usePropertyConsoleOverview'

const { selectedProperty, propertyId, debug } = usePropertyConsoleOverview()
</script>
