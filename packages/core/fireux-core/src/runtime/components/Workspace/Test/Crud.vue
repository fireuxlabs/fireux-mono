<template>
  <div>
    <div class="flex flex-wrap gap-4">
      <div class="space-y-2">
        <p class="text-xs text-muted">Collection</p>
        <WorkspaceCrudToolbar
          :label="`${entityLabel} Test collection`"
          :actions="['create', 'read']"
          :available="derived.capability.availableActions"
          @create="openCreate"
          @read="readOpen = true"
        />
      </div>
      <div class="space-y-2">
        <p class="text-xs text-muted">Selected record</p>
        <WorkspaceCrudToolbar
          :label="`${entityLabel} selected Test`"
          :actions="['update', 'delete']"
          :available="derived.capability.availableActions"
          @update="edit"
          @delete="deleteOpen = true"
        />
      </div>
    </div>
    <WorkspaceTestCrudCreate
      v-model:open="createOpen"
      :initial-value="createValue"
      :entity-label="entityLabel"
      :primitives="primitives"
    />
    <WorkspaceTestCrudRead
      v-model:open="readOpen"
      :route-base="routeBase"
      :state="state"
      :natives="natives"
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
        ><div class="grid gap-3">
          <p v-if="error" role="alert" class="text-error">{{ error }}</p>
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
import type { TestAIIntent } from '../../../composables/fireux/useTestAI'
import type { useTest } from '../../../composables/fireux/useTest'
type Workspace = ReturnType<typeof useTest>
type WorkspaceTestDerived = Workspace['derived']['value']
type WorkspaceTestState = Workspace['state']['value']
const props = defineProps<{
  entityLabel: string
  routeBase: string
  state: WorkspaceTestState
  derived: WorkspaceTestDerived
  primitives: Workspace['primitives']
  natives: Workspace['natives']
}>()
const value = ref('')
const createValue = ref('')
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
function openCreate() {
  createValue.value = ''
  createOpen.value = true
}
function edit() {
  value.value = selected.value?.value || ''
  error.value = ''
  editOpen.value = true
}
async function update() {
  if (!value.value.trim()) {
    error.value = 'Enter some text for this Test.'
    return
  }
  saving.value = true
  error.value = ''
  try {
    if (!(await props.primitives.update(value.value))) {
      error.value = 'This Test is no longer available to update.'
      return
    }
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
  error.value = ''
  try {
    if (!(await props.primitives.delete())) {
      error.value = 'This Test is no longer available to delete.'
      return
    }
    deleteOpen.value = false
    editOpen.value = false
  } catch (cause) {
    error.value =
      cause instanceof Error ? cause.message : 'Test could not be deleted.'
  } finally {
    deleting.value = false
  }
}
function openAction(intent: TestAIIntent) {
  if (
    intent.action === 'none' ||
    !props.derived.capability.primitives[intent.action].available
  )
    return
  error.value = ''
  if (intent.action === 'create') {
    createValue.value = intent.value
    createOpen.value = true
  }
  if (intent.action === 'read') readOpen.value = true
  if (intent.action === 'update') {
    edit()
    if (intent.value) value.value = intent.value
  }
  if (intent.action === 'delete') deleteOpen.value = true
}
defineExpose({ openAction })
</script>
