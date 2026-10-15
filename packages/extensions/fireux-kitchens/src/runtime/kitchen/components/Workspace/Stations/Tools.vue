<template>
  <section v-if="tool" class="space-y-3" aria-labelledby="station-tools-title">
    <div
      class="flex items-center gap-3 rounded-xl border border-default bg-elevated/50 p-2 shadow-sm"
    >
      <div class="min-w-0 px-2">
        <h2
          id="station-tools-title"
          class="text-xs font-semibold uppercase tracking-wide text-muted"
        >
          Tools
        </h2>
        <p class="hidden text-xs text-dimmed sm:block">Station actions</p>
      </div>
      <UButton
        :label="tool.label"
        icon="i-lucide-layout-grid"
        size="sm"
        @click="performAction(tool.id)"
      />
    </div>

    <UModal
      :open="activeToolId === tool.id"
      title="Add station"
      description="Create a production destination for the selected Kitchen."
      @update:open="(open) => !open && closeTool()"
    >
      <template #body>
        <WorkspaceKitchenStationsCreate />
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
