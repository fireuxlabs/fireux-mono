<template>
  <div>
    <WorkspaceCrudToolbar
      label="Project Test"
      :available="available"
      @create="createOpen = true"
      @read="readOpen = true"
      @update="edit"
      @delete="deleteOpen = true"
    />

    <WorkspaceProjectTestCrudCreate
      v-model:open="createOpen"
      :actions="actions"
    />

    <WorkspaceProjectTestCrudRead v-model:open="readOpen" :state="state" />

    <UModal
      v-model:open="editOpen"
      title="Edit Test"
      description="Update the selected Test name."
      :ui="{ content: 'sm:max-w-md' }"
    >
      <template #body>
        <form class="space-y-5" @submit.prevent="update">
          <UFormField label="Name" :error="error || undefined">
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
              <UButton label="Save changes" type="submit" :loading="saving" />
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
            :loading="deleting"
            @click="remove"
          />
        </div>
      </template>
    </UModal>
  </div>
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
const readOpen = ref(false)
const editOpen = ref(false)
const deleteOpen = ref(false)
const saving = ref(false)
const deleting = ref(false)
const error = ref('')
const selected = computed(() =>
  props.state.tests.find((test) => test.id === props.state.selectedTestId)
)
const available = computed(() => props.derived.capability.availableActions)

function edit() {
  name.value = selected.value?.name || ''
  error.value = ''
  editOpen.value = true
}

async function update() {
  if (!name.value.trim()) return
  saving.value = true
  error.value = ''
  try {
    await props.actions.update(name.value)
    editOpen.value = false
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Test could not be updated.'
  } finally {
    saving.value = false
  }
}

async function remove() {
  deleting.value = true
  try {
    await props.actions.delete()
    deleteOpen.value = false
    editOpen.value = false
  } finally {
    deleting.value = false
  }
}
</script>
