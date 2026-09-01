<template>
  <section class="flex items-center gap-2" aria-label="Test selector">
    <UTabs
      v-if="state.tests.length"
      :model-value="state.selectedIndex"
      :items="items"
      :content="false"
      variant="link"
      size="sm"
      class="w-fit max-w-full"
      @update:model-value="actions.select(Number($event))"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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

const items = computed(() =>
  props.state.tests.map((test: ProjectTest, index: number) => ({
    label: test.name,
    value: index,
  }))
)
</script>
