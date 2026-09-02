<template>
  <div class="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Test natives">
    <UButton
      v-for="native in natives"
      :key="native.label"
      :label="native.label"
      :icon="native.icon"
      color="neutral"
      variant="soft"
      :disabled="!selected"
      @click="run(native.action)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { useProjectWorkspaceTest } from '../../../../project/composables/workspace/test/useProjectWorkspaceTest'

type Workspace = ReturnType<typeof useProjectWorkspaceTest>
type NativeAction = 'capitalize' | 'uppercase' | 'lowercase' | 'toggleBold'

const props = defineProps<{
  state: Workspace['state']['value']
  actions: Workspace['actions']
}>()

const selected = computed(() =>
  props.state.tests.find((test) => test.id === props.state.selectedTestId)
)
const natives = [
  {
    label: 'Capitalize',
    icon: 'i-lucide-case-upper',
    action: 'capitalize',
  },
  { label: 'Uppercase', icon: 'i-lucide-a-large-small', action: 'uppercase' },
  { label: 'Lowercase', icon: 'i-lucide-case-lower', action: 'lowercase' },
  { label: 'Bold', icon: 'i-lucide-bold', action: 'toggleBold' },
] satisfies Array<{ label: string; icon: string; action: NativeAction }>

function run(action: NativeAction) {
  if (selected.value) props.actions[action]()
}
</script>
