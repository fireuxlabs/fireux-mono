<template>
  <section class="min-w-0 shrink-0" :aria-label="`${entityLabel} Test`">
    <UCard
      :ui="{
        root: 'overflow-hidden',
        header: 'px-4 py-4 sm:px-5',
        body: 'p-5 sm:p-6',
        footer: 'px-5 py-3',
      }"
    >
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <UIcon name="i-lucide-file-text" class="size-5 text-muted" />
            <h2 class="font-semibold text-highlighted">Test</h2>
            <UBadge
              :label="String(state.tests.length)"
              color="neutral"
              variant="subtle"
            />
          </div>
          <WorkspaceTestCrud
            ref="crud"
            :entity-label="entityLabel"
            :route-base="routeBase"
            :state="state"
            :derived="derived"
            :primitives="primitives"
            :natives="natives"
          />
        </div>
      </template>
      <div
        v-if="derived.status === 'loading' || derived.status === 'idle'"
        class="space-y-3"
      >
        <USkeleton class="h-4 w-24" />
        <USkeleton class="h-8 w-full max-w-lg" />
      </div>
      <UAlert
        v-else-if="derived.status === 'error'"
        color="error"
        title="Tests could not be loaded"
        description="Try reloading the page. Your records have not been changed."
      />
      <div v-else-if="selected" class="space-y-3">
        <p class="text-xs font-medium uppercase tracking-wide text-muted">
          Selected record
        </p>
        <p
          class="break-words whitespace-pre-wrap text-xl font-medium text-highlighted"
        >
          {{ selected.value }}
        </p>
      </div>
      <UAlert
        v-else
        color="neutral"
        variant="subtle"
        icon="i-lucide-file-plus-2"
        title="No Tests yet"
        description="Choose Create and give your first Test some text."
      />
    </UCard>
  </section>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import WorkspaceTestCrud from './Crud.vue'
import type { TestAIIntent } from '../../../composables/fireux/useTestAI'
import type { useTest } from '../../../composables/fireux/useTest'
type Workspace = ReturnType<typeof useTest>
type WorkspaceTestDerived = Workspace['derived']['value']
type WorkspaceTestState = Workspace['state']['value']
const props = defineProps<{
  entityLabel: string
  routeBase: string
  state: WorkspaceTestState
  derived: WorkspaceTestDerived
  primitives: Workspace['primitives']
  natives: Workspace['natives']
}>()
const crud = ref<InstanceType<typeof WorkspaceTestCrud>>()
defineExpose({
  openAction: (intent: TestAIIntent) => crud.value?.openAction(intent),
})
const selected = computed(() =>
  props.state.tests.find((test) => test.id === props.state.selectedTestId)
)
</script>
