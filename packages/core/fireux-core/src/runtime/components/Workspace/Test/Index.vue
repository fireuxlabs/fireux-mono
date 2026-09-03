<template>
  <section
    class="workspace-surface workspace-surface--compact"
    :aria-label="`${entityLabel} Test`"
  >
    <WorkspaceTestCrud
      :entity-label="entityLabel"
      :route-base="routeBase"
      :state="state"
      :derived="derived"
      :primitives="primitives"
    />
    <template v-if="derived.status === 'loading'"
      ><USkeleton class="h-8 w-full max-w-lg rounded-md" /><USkeleton
        class="h-4 w-20"
    /></template>
    <template v-else-if="state.tests.length"
      ><p v-if="selected" class="text-xl text-highlighted">
        {{ selected.value }}
      </p>
      <p class="text-sm text-muted">{{ capacity }}</p></template
    >
    <UAlert
      v-else
      color="neutral"
      variant="subtle"
      icon="i-lucide-flask-conical"
      title="No Tests yet"
      :description="`Create the first Test to begin this ${entityLabel} Test pipeline.`"
    />
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { useTest } from '../../../composables/fireux/workspace/useTest'
type Workspace = ReturnType<typeof useTest>
type WorkspaceTestDerived = Workspace['derived']['value']
type WorkspaceTestState = Workspace['state']['value']
const props = defineProps<{
  entityLabel: string
  routeBase: string
  state: WorkspaceTestState
  derived: WorkspaceTestDerived
  primitives: Workspace['primitives']
}>()
const selected = computed(() =>
  props.state.tests.find((test) => test.id === props.state.selectedTestId)
)
const capacity = computed(() =>
  props.derived.capability.primitives.create.limit != null
    ? `${props.state.tests.length} of ${props.derived.capability.primitives.create.limit}`
    : `${props.state.tests.length} Tests`
)
</script>
