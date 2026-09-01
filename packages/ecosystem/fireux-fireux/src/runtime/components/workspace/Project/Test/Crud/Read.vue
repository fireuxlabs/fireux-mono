<template>
  <UModal
    :open="open"
    title="Read Tests"
    description="Choose a Test to open its detail page."
    :ui="{ content: 'sm:max-w-lg' }"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <div class="grid gap-2">
        <UButton
          v-for="test in state.tests"
          :key="test.id"
          :to="`/workspace/project/test/${test.id}`"
          :label="test.name"
          icon="i-lucide-file-text"
          color="neutral"
          variant="soft"
          block
          class="justify-start"
          @click="emit('update:open', false)"
        />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { useProjectWorkspaceTest } from '../../../../../project/composables/workspace/test/useProjectWorkspaceTest'

type Workspace = ReturnType<typeof useProjectWorkspaceTest>

defineProps<{
  open: boolean
  state: Workspace['state']['value']
}>()

const emit = defineEmits<{
  (event: 'update:open', open: boolean): void
}>()
</script>
