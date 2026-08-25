<template>
  <section v-if="tool" class="space-y-3" aria-labelledby="recipe-tools-title">
    <div
      class="flex items-center gap-3 rounded-xl border border-default bg-elevated/50 p-2 shadow-sm"
    >
      <div class="min-w-0 px-2">
        <h2
          id="recipe-tools-title"
          class="text-xs font-semibold uppercase tracking-wide text-muted"
        >
          Tools
        </h2>
        <p class="hidden text-xs text-dimmed sm:block">Recipe actions</p>
      </div>
      <UButton
        :label="tool.label"
        icon="i-lucide-notebook-pen"
        size="sm"
        @click="performAction(tool.id)"
      />
    </div>

    <UModal
      :open="activeToolId === tool.id"
      title="Create recipe"
      description="Add a Recipe to the selected Kitchen."
      @update:open="(open) => !open && closeTool()"
    >
      <template #body>
        <WorkspaceKitchenRecipesWrite />
      </template>
    </UModal>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenCapabilityTools } from '../../../composables/workspace/useKitchenCapabilityTools'

const { tools, activeToolId, performAction, closeTool } =
  useKitchenCapabilityTools('recipes')
const tool = computed(() =>
  tools.value.find(
    (candidate) => candidate.id === 'kitchen.recipes.create-recipe'
  )
)
</script>
