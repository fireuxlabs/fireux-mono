<template>
  <section
    class="workspace-surface workspace-surface--compact"
    aria-label="Project Test"
  >
    <WorkspaceProjectTestCrud
      :state="state"
      :derived="derived"
      :actions="actions"
    />
    <WorkspaceProjectTestNatives :state="state" :actions="actions" />
    <template v-if="derived.outcome === 'pending'">
      <USkeleton class="h-8 w-full max-w-lg rounded-md" />
      <USkeleton class="h-4 w-20" />
    </template>
    <template v-else-if="state.tests.length">
      <div v-if="selected" class="flex items-center gap-2">
        <p
          class="text-xl text-highlighted"
          :class="{ 'font-bold': state.bold }"
        >
          {{ selected.name }}
        </p>
      </div>
      <p class="text-sm text-muted">
        {{ capacity }}
      </p>
    </template>
    <UAlert
      v-else
      color="neutral"
      variant="subtle"
      icon="i-lucide-flask-conical"
      title="No Tests yet"
      description="Create the first Test to begin this Project Test pipeline."
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { useProjectWorkspaceTest } from '../../../../project/composables/workspace/test/useProjectWorkspaceTest'

type Workspace = ReturnType<typeof useProjectWorkspaceTest>

const props = defineProps<{
  state: Workspace['state']['value']
  derived: Workspace['derived']['value']
  actions: Workspace['actions']
}>()

const selected = computed(() => props.state.tests[props.state.selectedIndex])
const capacity = computed(() =>
  props.derived.limit !== null
    ? `${props.state.tests.length} of ${props.derived.limit}`
    : `${props.state.tests.length} Tests`
)
</script>
