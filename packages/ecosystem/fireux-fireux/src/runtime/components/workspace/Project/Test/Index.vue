<template>
  <UPageSection title="Tests" class="py-4 sm:py-4">
    <p
      v-if="selected"
      class="text-xl text-highlighted"
      :class="{ 'font-bold': state.bold }"
    >
      {{ selected.name }}
    </p>
    <div class="flex max-w-lg gap-2">
      <UInput
        v-model="name"
        :placeholder="selected ? 'Update name' : 'Name'"
        class="flex-1"
        @keyup.enter="selected ? update() : create()"
      />
      <UButton
        v-if="selected"
        label="Update"
        icon="i-lucide-save"
        @click="update"
      />
      <UButton
        v-else
        label="Create"
        icon="i-lucide-plus"
        :disabled="!derived.canCreateTest"
        @click="create"
      />
      <UButton
        v-if="selected"
        icon="i-lucide-trash-2"
        color="error"
        variant="ghost"
        aria-label="Delete Test"
        @click="remove"
      />
    </div>
    <p class="text-sm text-muted">
      {{ capacity }}
    </p>
  </UPageSection>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { useProjectWorkspaceTest } from '../../../../project/composables/workspace/test/useProjectWorkspaceTest'

type Workspace = ReturnType<typeof useProjectWorkspaceTest>

const props = defineProps<{
  state: Workspace['state']['value']
  derived: Workspace['derived']['value']
  actions: Workspace['actions']
}>()

const name = ref('')
const selected = computed(() => props.state.tests[props.state.selectedIndex])
const capacity = computed(() =>
  props.derived.limit !== null
    ? `${props.state.tests.length} of ${props.derived.limit}`
    : `${props.state.tests.length} Tests`
)

watch(
  selected,
  (test) => {
    name.value = test?.name || ''
  },
  { immediate: true }
)

function create() {
  props.actions.create(name.value)
  name.value = ''
}

function update() {
  props.actions.update(name.value)
}

function remove() {
  props.actions.remove()
}
</script>
