<template>
  <section
    v-if="tool"
    class="workspace-surface workspace-surface--compact"
    aria-labelledby="station-tools-title"
  >
    <UCard description="Station actions">
      <template #title><h2 id="station-tools-title">Tools</h2></template>
      <UButton
        :label="tool.label"
        icon="i-lucide-layout-grid"
        size="sm"
        @click="performAction(tool.id)"
      />
    </UCard>

    <UModal
      :open="activeToolId === tool.id"
      title="Add station"
      description="Create a production destination for the selected Kitchen."
      @update:open="(open) => !open && closeTool()"
    >
      <template #body>
        <KitchenPrepAndProductionStationsCreate />
      </template>
    </UModal>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenCapabilityTools } from '../../../composables/workspace/useKitchenCapabilityTools'

const { tools, activeToolId, performAction, closeTool } =
  useKitchenCapabilityTools('stations')
const tool = computed(() =>
  tools.value.find(
    (candidate) => candidate.id === 'kitchen.stations.create-station'
  )
)
</script>
