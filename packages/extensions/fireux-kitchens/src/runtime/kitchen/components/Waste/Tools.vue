<template>
  <section
    v-if="tool"
    class="workspace-surface workspace-surface--compact"
    aria-labelledby="waste-tools-title"
  >
    <UCard description="Waste actions">
      <template #title><h2 id="waste-tools-title">Tools</h2></template>
      <UButton
        :label="tool.label"
        icon="i-lucide-trash-2"
        size="sm"
        :disabled="!canWrite"
        @click="performAction(tool.id)"
      />
    </UCard>

    <UModal
      :open="activeToolId === tool.id"
      title="Record Waste"
      description="Record what was wasted, how much, why, and where it happened."
      @update:open="(open) => !open && closeTool()"
    >
      <template #body>
        <KitchenWasteCreate @cancel="closeTool" @created="handleCreated" />
      </template>
    </UModal>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useToast } from '#imports'
import { useKitchenCapabilityTools } from '../../composables/workspace/useKitchenCapabilityTools'
import { useKitchenWorkspaceWaste } from '../../composables/workspace/waste/useKitchenWorkspaceWaste'

const toast = useToast()
const { canWrite } = useKitchenWorkspaceWaste()
const { tools, activeToolId, performAction, closeTool } =
  useKitchenCapabilityTools('waste')
const tool = computed(() =>
  tools.value.find((candidate) => candidate.id === 'kitchen.waste.record-event')
)

function handleCreated(result: { id: string; itemName: string }) {
  closeTool()
  toast.add({
    title: `${result.itemName} recorded`,
    description: 'The Waste event is now part of this Kitchen’s evidence.',
    color: 'success',
    icon: 'i-lucide-circle-check',
  })
}
</script>
