<template>
  <WorkspaceKitchenMiseTools v-if="operation === 'mise'" />
  <WorkspaceKitchenRecipesTools v-else-if="operation === 'recipes'" />
  <WorkspaceKitchenStationsTools v-else-if="operation === 'stations'" />

  <section
    v-else-if="tools.length"
    class="space-y-3"
    :aria-labelledby="`${operation}-tools-title`"
  >
    <div
      class="flex flex-wrap items-center gap-3 rounded-xl border border-default bg-elevated/50 p-2 shadow-sm"
    >
      <div class="min-w-0 px-2">
        <h2
          :id="`${operation}-tools-title`"
          class="text-xs font-semibold uppercase tracking-wide text-muted"
        >
          Tools
        </h2>
        <p class="hidden text-xs text-dimmed sm:block">{{ title }} actions</p>
      </div>

      <UButton
        v-for="tool in tools"
        :key="tool.id"
        :label="tool.label"
        icon="i-lucide-plus"
        size="sm"
        @click="performAction(tool.id)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenOperationCapabilitySlug } from '../../../models/operation-capabilities'
import { kitchenOperations } from '../../../models/operations'
import { useKitchenCapabilityTools } from '../../../composables/workspace/useKitchenCapabilityTools'

const props = defineProps<{ operation: KitchenOperationCapabilitySlug }>()
const { tools, performAction } = useKitchenCapabilityTools(props.operation)
const title = computed(
  () =>
    kitchenOperations.find((entry) => entry.slug === props.operation)?.title ||
    props.operation
)
</script>
