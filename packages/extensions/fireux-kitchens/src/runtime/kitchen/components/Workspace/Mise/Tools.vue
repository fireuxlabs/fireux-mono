<template>
  <section class="space-y-3" aria-labelledby="mise-tools-title">
    <div
      class="flex items-center gap-3 rounded-xl border border-default bg-elevated/50 p-2 shadow-sm"
    >
      <div class="min-w-0 px-2">
        <h2
          id="mise-tools-title"
          class="text-xs font-semibold uppercase tracking-wide text-muted"
        >
          Tools
        </h2>
        <p class="hidden text-xs text-dimmed sm:block">Mise actions</p>
      </div>
      <UButton
        :label="tool.label"
        :icon="tool.icon"
        size="sm"
        :disabled="!canWrite"
        @click="performAction(toolDefinition.id)"
      />
    </div>

    <UModal
      v-model:open="open"
      title="Add prep task"
      description="Add one task to the Kitchen prep list."
    >
      <template #body>
        <WorkspaceKitchenMiseCreate
          @cancel="open = false"
          @created="handleCreated"
        />
      </template>
    </UModal>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useToast } from '#imports'
import { kitchenMiseHumanTools } from '../../../tools/mise'
import { useKitchenMiseWorkspace } from '../../../composables/workspace/Mise/useKitchenMiseWorkspace'
import { useKitchenCapabilityTools } from '../../../composables/workspace/useKitchenCapabilityTools'

const toast = useToast()
const { canWrite } = useKitchenMiseWorkspace()
const toolDefinition = kitchenMiseHumanTools[0]
const tool = toolDefinition.surfaces.human
const { activeToolId, performAction, closeTool } =
  useKitchenCapabilityTools('mise')
const open = computed({
  get: () => activeToolId.value === toolDefinition.id,
  set: (value: boolean) => {
    if (!value) closeTool()
  },
})

function handleCreated(result: { title: string }) {
  open.value = false
  toast.add({
    title: `${result.title} added`,
    description: 'The task is now on the Kitchen prep list.',
    color: 'success',
    icon: 'i-lucide-list-checks',
  })
}
</script>
