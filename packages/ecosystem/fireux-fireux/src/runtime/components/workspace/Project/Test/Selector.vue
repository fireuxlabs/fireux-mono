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
      @update:model-value="actions.select(String($event))"
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

    <WorkspaceProjectTestCrudCreate
      v-model:open="createOpen"
      :actions="actions"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type {
  ProjectTest,
  useProjectWorkspaceTest,
} from '../../../../project/composables/workspace/test/useProjectWorkspaceTest'

type Workspace = ReturnType<typeof useProjectWorkspaceTest>

const props = defineProps<{
  state: Workspace['state']['value']
  derived: Workspace['derived']['value']
  actions: Workspace['actions']
}>()

const createOpen = ref(false)

const items = computed(() =>
  props.state.tests.map((test: ProjectTest) => ({
    label: test.name,
    value: test.id,
  }))
)
</script>
