<template>
  <section v-if="tool" class="space-y-3" aria-labelledby="waste-tools-title">
    <div
      class="flex items-center gap-3 rounded-xl border border-default bg-elevated/50 p-2 shadow-sm"
    >
      <div class="min-w-0 px-2">
        <h2
          id="waste-tools-title"
          class="text-xs font-semibold uppercase tracking-wide text-muted"
        >
          Tools
        </h2>
        <p class="hidden text-xs text-dimmed sm:block">Waste actions</p>
      </div>
      <UButton
        :label="tool.label"
        icon="i-lucide-trash-2"
        size="sm"
        :disabled="!canWrite"
        @click="performAction(tool.id)"
      />
    </div>

    <UModal
      :open="activeToolId === tool.id"
      title="Record Waste"
      description="Record what was wasted, how much, why, and where it happened."
      @update:open="(open) => !open && closeTool()"
    >
      <template #body>
        <KitchenWasteCreate
          @cancel="closeTool"
          @created="handleCreated"
        />
      </template>
    </UModal>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useToast } from '#imports'
import { useKitchenCapabilityTools } from '../../composables/workspace/useKitchenCapabilityTools'
import { useKitchenWaste } from '../../composables/workspace/waste/useKitchenWaste'

const toast = useToast()
const { canWrite } = useKitchenWaste()
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
