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
    <UButton
      v-if="derived.canCreateTest"
      icon="i-lucide-plus"
      color="neutral"
      variant="ghost"
      aria-label="New Test"
      @click="createOpen = true"
    />

    <UModal
      v-model:open="createOpen"
      title="Create Test"
      description="Add one named Test to this Project."
      :ui="{ content: 'sm:max-w-md' }"
    >
      <template #body>
        <form class="space-y-5" @submit.prevent="create">
          <UFormField label="Name">
            <UInput
              v-model="name"
              name="name"
              autocomplete="off"
              autofocus
              class="w-full"
            />
          </UFormField>
          <div class="flex justify-end gap-2">
            <UButton
              label="Cancel"
              color="neutral"
              variant="ghost"
              type="button"
              @click="createOpen = false"
            />
            <UButton label="Create Test" icon="i-lucide-plus" type="submit" />
          </div>
        </form>
      </template>
    </UModal>
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
const name = ref('')

const items = computed(() =>
  props.state.tests.map((test: ProjectTest, index: number) => ({
    label: test.name,
    value: index,
  }))
)

function create() {
  const value = name.value.trim()
  if (!value) return
  props.actions.create(value)
  name.value = ''
  createOpen.value = false
}
</script>
