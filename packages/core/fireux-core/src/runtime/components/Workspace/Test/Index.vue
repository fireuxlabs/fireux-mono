<template>
  <WorkspaceCapability collection-label="Tests">
    <template #workspace-tools>
      <WorkspaceContextTools
        title="Test context"
        :workspace="workspace.family"
      />
    </template>
    <template #collection-panel>
      <TestCollection
        :records="records"
        :selected-id="selected?.id"
        :pending="pending"
        :read-error="readError"
        :create="create"
        @select="selectedId = $event"
      />
    </template>
    <template #selected-panel>
      <TestIndividual
        :key="selected?.id"
        :record="selected"
        :update="update"
        :remove="remove"
      />
    </template>
    <template #workspace-open-tools>
      <WorkspaceContextTools
        title="Test workspace context"
        :workspace="workspace.family"
        open
      />
    </template>
  </WorkspaceCapability>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import WorkspaceCapability from '../Capability.vue'
import TestCollection from './Collection.vue'
import TestIndividual from './Individual.vue'
import WorkspaceContextTools from '../ContextTools.vue'
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
const page = useWorkspacePageState(props.workspace.family)
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
</script>
