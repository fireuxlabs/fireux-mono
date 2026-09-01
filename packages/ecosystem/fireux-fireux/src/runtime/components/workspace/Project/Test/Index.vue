<template>
  <UPageSection title="Tests" class="py-4 sm:py-4">
    <WorkspaceCrudToolbar
      label="Project Test"
      :available="available"
      @create="createOpen = true"
      @read="read"
      @update="edit"
      @delete="deleteOpen = true"
    />
    <template v-if="derived.outcome === 'pending'">
      <USkeleton class="h-8 w-full max-w-lg rounded-md" />
      <USkeleton class="h-4 w-20" />
    </template>
    <template v-else>
      <div v-if="selected" class="flex items-center gap-2">
        <p
          class="text-xl text-highlighted"
          :class="{ 'font-bold': state.bold }"
        >
          {{ selected.name }}
        </p>
        <UButton
          icon="i-lucide-ellipsis-vertical"
          color="neutral"
          variant="ghost"
          aria-label="Edit Test"
          @click="edit"
        />
      </div>
      <p class="text-sm text-muted">
        {{ capacity }}
      </p>
    </template>

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

    <UModal
      v-model:open="editOpen"
      title="Edit Test"
      description="Update the selected Test name."
      :ui="{ content: 'sm:max-w-md' }"
    >
      <template #body>
        <form class="space-y-5" @submit.prevent="update">
          <UFormField label="Name">
            <UInput
              v-model="name"
              name="name"
              autocomplete="off"
              autofocus
              class="w-full"
            />
          </UFormField>
          <div class="flex justify-between gap-2">
            <UButton
              label="Delete Test"
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              type="button"
              @click="deleteOpen = true"
            />
            <div class="flex gap-2">
              <UButton
                label="Cancel"
                color="neutral"
                variant="ghost"
                type="button"
                @click="editOpen = false"
              />
              <UButton label="Save changes" type="submit" />
            </div>
          </div>
        </form>
      </template>
    </UModal>

    <UModal
      v-model:open="deleteOpen"
      :title="`Delete ${selected?.name || 'Test'}?`"
      description="This removes the selected Test."
      :ui="{ content: 'sm:max-w-md' }"
    >
      <template #body>
        <div class="flex justify-end gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="ghost"
            @click="deleteOpen = false"
          />
          <UButton
            label="Delete Test"
            icon="i-lucide-trash-2"
            color="error"
            @click="remove"
          />
        </div>
      </template>
    </UModal>
  </UPageSection>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { useProjectWorkspaceTest } from '../../../../project/composables/workspace/test/useProjectWorkspaceTest'

type Workspace = ReturnType<typeof useProjectWorkspaceTest>

const props = defineProps<{
  state: Workspace['state']['value']
  derived: Workspace['derived']['value']
  actions: Workspace['actions']
}>()

const name = ref('')
const createOpen = ref(false)
const editOpen = ref(false)
const deleteOpen = ref(false)
const selected = computed(() => props.state.tests[props.state.selectedIndex])
const capacity = computed(() =>
  props.derived.limit !== null
    ? `${props.state.tests.length} of ${props.derived.limit}`
    : `${props.state.tests.length} Tests`
)
const available = computed<Array<'create' | 'read' | 'update' | 'delete'>>(
  () => [
    ...(props.derived.canCreateTest ? (['create'] as const) : []),
    ...(selected.value ? (['read', 'update', 'delete'] as const) : []),
  ]
)
function create() {
  const value = name.value.trim()
  if (!value) return
  props.actions.create(value)
  name.value = ''
  createOpen.value = false
}

function read() {
  if (selected.value) props.actions.select(props.state.selectedIndex)
}

function edit() {
  name.value = selected.value?.name || ''
  editOpen.value = true
}

function update() {
  if (!name.value.trim()) return
  props.actions.update(name.value)
  editOpen.value = false
}

function remove() {
  props.actions.remove()
  deleteOpen.value = false
  editOpen.value = false
}
</script>
