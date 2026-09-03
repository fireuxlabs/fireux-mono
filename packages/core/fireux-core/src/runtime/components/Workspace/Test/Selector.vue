<template>
  <section class="flex items-center gap-2" aria-label="Test selector">
    <UTabs
      v-if="state.tests.length"
      :model-value="state.selectedTestId"
      :items="items"
      :content="false"
      variant="link"
      size="sm"
      class="w-fit max-w-full"
      @update:model-value="natives.select(String($event))"
    />
    <UButton
      v-if="derived.capability.primitives.create.available"
      icon="i-lucide-plus"
      color="neutral"
      variant="soft"
      size="sm"
      aria-label="Create Test"
      @click="createOpen = true"
    />
    <WorkspaceTestCrudCreate
      v-model:open="createOpen"
      :entity-label="entityLabel"
      :primitives="primitives"
    />
  </section>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import type { useTest } from '../../../composables/fireux/workspace/useTest'
type Workspace = ReturnType<typeof useTest>
type WorkspaceTestDerived = Workspace['derived']['value']
type WorkspaceTestState = Workspace['state']['value']
const props = defineProps<{
  entityLabel: string
  state: WorkspaceTestState
  derived: WorkspaceTestDerived
  primitives: Workspace['primitives']
  natives: Workspace['natives']
}>()
const createOpen = ref(false)
const items = computed(() =>
  props.state.tests.map((test) => ({ label: test.value, value: test.id }))
)
</script>
