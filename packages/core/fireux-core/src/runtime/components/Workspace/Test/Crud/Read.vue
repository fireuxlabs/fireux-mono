<template>
  <UModal
    :open="open"
    title="Read Tests"
    description="Choose a Test to open its detail page."
    :ui="{ content: 'sm:max-w-lg' }"
    @update:open="emit('update:open', $event)"
  >
    <template #body
      ><div class="grid gap-2">
        <UButton
          v-for="test in state.tests"
          :key="test.id"
          :to="`${routeBase}/${test.id}`"
          :label="test.value"
          icon="i-lucide-file-text"
          color="neutral"
          variant="soft"
          block
          class="justify-start"
          @click="emit('update:open', false)"
        /></div
    ></template>
  </UModal>
</template>
<script setup lang="ts">
import type { useTest } from '../../../../composables/fireux/workspace/useTest'
type WorkspaceTestState = ReturnType<typeof useTest>['state']['value']
defineProps<{ open: boolean; routeBase: string; state: WorkspaceTestState }>()
const emit = defineEmits<{ (event: 'update:open', open: boolean): void }>()
</script>
