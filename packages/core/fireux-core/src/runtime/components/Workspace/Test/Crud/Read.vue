<template>
  <UModal
    :open="open"
    title="Read Tests"
    description="Choose the Test to focus on. Your page stays open."
    :ui="{ content: 'sm:max-w-lg' }"
    @update:open="emit('update:open', $event)"
  >
    <template #body
      ><div class="grid gap-2">
        <UButton
          v-for="test in state.tests"
          :key="test.id"
          :variant="test.id === state.selectedTestId ? 'subtle' : 'ghost'"
          :label="test.value"
          icon="i-lucide-file-text"
          color="neutral"
          block
          class="justify-start"
          @click="select(test.id)"
        /></div
    ></template>
  </UModal>
</template>
<script setup lang="ts">
import type { useTest } from '../../../../composables/fireux/useTest'
type WorkspaceTestState = ReturnType<typeof useTest>['state']['value']
const props = defineProps<{
  open: boolean
  routeBase: string
  state: WorkspaceTestState
  natives: ReturnType<typeof useTest>['natives']
}>()
const emit = defineEmits<{ (event: 'update:open', open: boolean): void }>()
function select(id: string) {
  props.natives.select(id)
  emit('update:open', false)
}
</script>
