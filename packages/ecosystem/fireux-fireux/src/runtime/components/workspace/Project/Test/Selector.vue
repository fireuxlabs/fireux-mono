<template>
  <section
    v-if="state.tests.length"
    class="flex items-center gap-2"
    aria-label="Test selector"
  >
    <UTabs
      :model-value="state.selectedIndex"
      :items="items"
      :content="false"
      variant="link"
      size="sm"
      class="w-fit max-w-full"
      @update:model-value="actions.select(Number($event))"
    />
    <UButton
      v-if="derived.canCreateTest"
      icon="i-lucide-plus"
      color="neutral"
      variant="ghost"
      aria-label="New Test"
      @click="actions.select(-1)"
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

const items = computed(() =>
  props.state.tests.map((test, index) => ({ label: test.name, value: index }))
)
</script>
