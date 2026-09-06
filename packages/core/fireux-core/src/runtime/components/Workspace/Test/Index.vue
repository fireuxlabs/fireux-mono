<template>
  <WorkspaceCapability collection-label="Tests">
    <template #workspace-tools>
      <UButton
        icon="i-lucide-info"
        label="Test context"
        color="neutral"
        variant="ghost"
        @click="infoOpen = true"
      />
      <UModal v-model:open="infoOpen" title="Test context"
        ><template #body><WorkspaceCapabilityInfo /></template
      ></UModal>
    </template>
    <template #collection-tools>
      <UButton
        icon="i-lucide-plus"
        label="Create"
        size="sm"
        :disabled="pending || readError"
        @click="createOpen = true"
      />
      <UModal v-model:open="createOpen" title="Create a Test"
        ><template #body
          ><TestForm
            label="Create"
            :submit="create"
            @saved="createOpen = false" /></template
      ></UModal>
    </template>
    <template #collection>
      <p v-if="pending" class="text-muted">Loading…</p>
      <div v-else-if="readError">
        <UAlert
          color="error"
          title="Tests could not be loaded"
        /><MoleculesCopyError message="Tests could not be loaded" />
      </div>
      <p v-else-if="!records.length" class="text-muted">No Tests yet.</p>
      <div v-else class="grid gap-1">
        <UButton
          v-for="record in records"
          :key="record.id"
          :label="record.value"
          color="neutral"
          :variant="selected?.id === record.id ? 'soft' : 'ghost'"
          class="justify-start text-left whitespace-normal break-words"
          :aria-pressed="selected?.id === record.id"
          @click="selectedId = record.id"
        />
      </div>
    </template>
    <template #collection-open-tools>
      <UCard v-if="!pending && !readError"
        ><template #header><h3 class="font-medium">Create a Test</h3></template
        ><TestForm label="Create" :submit="create"
      /></UCard>
    </template>
    <template #selected-tools>
      <UButton
        label="Update"
        size="sm"
        color="neutral"
        :disabled="!selected"
        @click="updateOpen = true"
      />
      <UButton
        label="Delete"
        size="sm"
        color="error"
        variant="ghost"
        :disabled="!selected || deleting"
        @click="deleteSelected"
      />
      <UModal v-model:open="updateOpen" title="Update Test"
        ><template #body
          ><TestForm
            v-if="selected"
            :key="selected.id"
            label="Update"
            :initial-value="selected.value"
            :submit="updateSelected"
            @saved="updateOpen = false" /></template
      ></UModal>
    </template>
    <template #selected>
      <p v-if="selected" class="break-words text-lg">{{ selected.value }}</p>
      <p v-else class="text-muted">Choose a Test.</p>
      <div v-if="error" role="alert">
        <p>{{ error }}</p>
        <MoleculesCopyError :message="error" />
      </div>
    </template>
    <template #selected-open-tools>
      <UCard v-if="selected" :key="selected.id">
        <template #header
          ><h3 class="font-medium">Update this Test</h3></template
        >
        <TestForm
          label="Update"
          :initial-value="selected.value"
          :submit="updateSelected"
        />
        <template #footer
          ><UButton
            label="Delete this Test"
            color="error"
            variant="soft"
            :loading="deleting"
            @click="deleteSelected"
        /></template>
      </UCard>
    </template>
    <template #workspace-open-tools>
      <UCard>
        <template #header
          ><h2 class="font-semibold">Test workspace context</h2></template
        >
        <WorkspaceCapabilityInfo />
        <template #footer
          ><UButton
            :label="copied ? 'Copied' : 'Copy JSON'"
            icon="i-lucide-copy"
            color="neutral"
            variant="soft"
            @click="copyContext"
        /></template>
      </UCard>
    </template>
  </WorkspaceCapability>
</template>
<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import WorkspaceCapability from '../Capability.vue'
import TestForm from './Form.vue'
import { useWorkspacePageState } from '../../../composables/fireux/workspace/useWorkspacePageState'
const props = defineProps<{
  workspace: { id: string; family: string }
  records: { id: string; value: string }[]
  pending: boolean
  readError: boolean
  create: (value: string) => Promise<void>
  update: (id: string, value: string) => Promise<void>
  remove: (id: string) => Promise<void>
}>()
const selectedId = ref('')
const selected = computed(
  () =>
    props.records.find((record) => record.id === selectedId.value) ??
    props.records[0] ??
    null
)
const createOpen = ref(false),
  updateOpen = ref(false),
  infoOpen = ref(false)
const deleting = ref(false),
  error = ref('')
const page = useWorkspacePageState(props.workspace.family)
const copied = ref(false)
async function copyContext() {
  try {
    await page.copy()
    copied.value = true
  } catch {
    error.value = 'Clipboard access was not allowed.'
  }
}
watchEffect(() =>
  page.publish({
    workspace: { id: props.workspace.id },
    collection: {
      records: props.records.map(({ id, value }) => ({ id, value })),
    },
    selected: selected.value
      ? { id: selected.value.id, value: selected.value.value }
      : null,
    derived: { pending: props.pending, readError: props.readError },
  })
)
const updateSelected = (value: string) =>
  selected.value
    ? props.update(selected.value.id, value)
    : Promise.reject(new Error('Choose a Test.'))
async function deleteSelected() {
  if (!selected.value || deleting.value) return
  deleting.value = true
  error.value = ''
  try {
    await props.remove(selected.value.id)
  } catch {
    error.value =
      'Delete could not be confirmed. Check the Tests before trying again.'
  } finally {
    deleting.value = false
  }
}
</script>
