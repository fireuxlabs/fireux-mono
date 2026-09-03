<template>
  <div>
    <WorkspaceCrudToolbar
      :label="`${entityLabel} Test`"
      :available="derived.capability.availableActions"
      @create="createOpen = true"
      @read="readOpen = true"
      @update="edit"
      @delete="deleteOpen = true"
    />
    <WorkspaceTestCrudCreate
      v-model:open="createOpen"
      :entity-label="entityLabel"
      :primitives="primitives"
    />
    <WorkspaceTestCrudRead
      v-model:open="readOpen"
      :route-base="routeBase"
      :state="state"
    />
    <UModal
      v-model:open="editOpen"
      title="Edit Test"
      description="Update the selected String value."
      :ui="{ content: 'sm:max-w-md' }"
      ><template #body
        ><form class="space-y-5" @submit.prevent="update">
          <UFormField label="Value" :error="error || undefined"
            ><UInput
              v-model="value"
              name="value"
              autocomplete="off"
              autofocus
              class="w-full"
          /></UFormField>
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
              /><UButton label="Save changes" type="submit" :loading="saving" />
            </div>
          </div></form></template
    ></UModal>
    <UModal
      v-model:open="deleteOpen"
      :title="`Delete ${selected?.value || 'Test'}?`"
      description="This removes the selected Test."
      :ui="{ content: 'sm:max-w-md' }"
      ><template #body
        ><div class="flex justify-end gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="ghost"
            @click="deleteOpen = false"
          /><UButton
            label="Delete Test"
            icon="i-lucide-trash-2"
            color="error"
            :loading="deleting"
            @click="remove"
          /></div></template
    ></UModal>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import type { useTest } from '../../../composables/fireux/workspace/useTest'
type Workspace = ReturnType<typeof useTest>
type WorkspaceTestDerived = Workspace['derived']['value']
type WorkspaceTestState = Workspace['state']['value']
const props = defineProps<{
  entityLabel: string
  routeBase: string
  state: WorkspaceTestState
  derived: WorkspaceTestDerived
  primitives: Workspace['primitives']
}>()
const value = ref('')
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
function edit() {
  value.value = selected.value?.value || ''
  error.value = ''
  editOpen.value = true
}
async function update() {
  if (!value.value.trim()) return
  saving.value = true
  error.value = ''
  try {
    await props.primitives.update(value.value)
    editOpen.value = false
  } catch (cause) {
    error.value =
      cause instanceof Error ? cause.message : 'Test could not be updated.'
  } finally {
    saving.value = false
  }
}
async function remove() {
  deleting.value = true
  try {
    await props.primitives.delete()
    deleteOpen.value = false
    editOpen.value = false
  } finally {
    deleting.value = false
  }
}
</script>
