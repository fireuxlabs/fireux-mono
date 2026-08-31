<template>
  <UPageSection title="Tools" class="py-4 sm:py-4">
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <UPageCard
        v-for="tool in tools"
        :key="tool.label"
        :title="tool.label"
        :icon="tool.icon"
        role="button"
        tabindex="0"
        :class="{ 'cursor-pointer': selected, 'opacity-50': !selected }"
        @click="run(tool.action)"
        @keydown.enter="run(tool.action)"
      />
    </div>
  </UPageSection>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { useProjectWorkspaceTest } from '../../../../project/composables/workspace/test/useProjectWorkspaceTest'

type Workspace = ReturnType<typeof useProjectWorkspaceTest>
type StringAction = 'capitalize' | 'uppercase' | 'lowercase' | 'toggleBold'

const props = defineProps<{
  state: Workspace['state']['value']
  actions: Workspace['actions']
}>()

const selected = computed(() => props.state.tests[props.state.selectedIndex])
const tools = [
  {
    label: 'Capitalize',
    icon: 'i-lucide-case-upper',
    action: 'capitalize',
  },
  { label: 'Uppercase', icon: 'i-lucide-a-large-small', action: 'uppercase' },
  { label: 'Lowercase', icon: 'i-lucide-case-lower', action: 'lowercase' },
  { label: 'Bold', icon: 'i-lucide-bold', action: 'toggleBold' },
] satisfies Array<{ label: string; icon: string; action: StringAction }>

function run(action: StringAction) {
  if (selected.value) props.actions[action]()
}
</script>
