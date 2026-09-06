<template>
  <section
    class="workspace-surface workspace-surface--compact"
    aria-label="Project"
  >
    <WorkspaceCrud
      label="Project"
      :available="[
        ...(creation.canCreate.value ? ['create' as const] : []),
        'read',
        ...(identity.canWrite.value ? ['update' as const] : []),
      ]"
    >
      <template #create="{ open, setOpen }">
        <WorkspaceProjectCrudCreate :open="open" @update:open="setOpen" />
      </template>
      <template #read="{ open, setOpen }">
        <WorkspaceProjectCrudRead :open="open" @update:open="setOpen" />
      </template>
      <template #update="{ open, setOpen }">
        <WorkspaceProjectIdentityWrite
          :identity="identity"
          :requested-open="open"
          @close="setOpen(false)"
        />
      </template>
    </WorkspaceCrud>
    <p v-if="identity.outcome.value === 'pending'" role="status">
      Loading selected Project…
    </p>
    <UAlert
      v-else-if="identity.outcome.value === 'error'"
      color="error"
      title="Project could not be loaded"
    />
    <UAlert
      v-else-if="identity.outcome.value === 'missing'"
      color="warning"
      title="Selected Project does not exist"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ProjectPublishedIdentity } from '../../models/published-identity'
import { useWorkspaceCreation } from '../../../composables/fireux/workspace/useWorkspaceCreation'
import WorkspaceProjectCrudCreate from './Crud/Create.vue'
import WorkspaceProjectCrudRead from './Crud/Read.vue'
import WorkspaceProjectIdentityWrite from './Identity/Write.vue'
import { useProjectWorkspaceIdentity } from '../../composables/workspace/identity/useProjectWorkspaceIdentity'

const props = defineProps<{ publication?: ProjectPublishedIdentity | null }>()
const creation = useWorkspaceCreation('project')
const identity = useProjectWorkspaceIdentity({
  publication: computed(() => props.publication),
})
</script>
