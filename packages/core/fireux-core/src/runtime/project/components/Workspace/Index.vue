<template>
  <WorkspaceCapability
    collection-label="Projects"
    aria-label="Project workspace"
  >
    <template #collection-tools>
      <UButton
        label="Create Project"
        icon="i-lucide-plus"
        :disabled="!creation.canCreate.value"
        @click="createOpen = true"
      />
      <WorkspaceProjectCrudCreate v-model:open="createOpen" />
    </template>
    <template #collection>
      <p v-if="index.outcome.value === 'pending'" role="status">
        Loading Projects…
      </p>
      <UAlert
        v-else-if="index.outcome.value === 'error'"
        color="error"
        title="Projects could not be loaded"
      />
      <div v-else-if="index.collection.value.length" class="grid gap-2">
        <UButton
          v-for="project in index.collection.value"
          :key="project.id"
          color="neutral"
          :variant="project.id === index.selectedId.value ? 'soft' : 'ghost'"
          class="justify-start"
          :aria-pressed="project.id === index.selectedId.value"
          @click="index.select(project.id)"
        >
          <UAvatar
            :src="project.image_url || undefined"
            :alt="project.name"
            icon="i-lucide-briefcase-business"
          />
          <span class="truncate">{{ project.name || project.id }}</span>
        </UButton>
      </div>
      <p v-else class="text-sm text-muted">Create a Project to get started.</p>
    </template>
    <template #selected-tools>
      <UButton
        label="Edit Project"
        icon="i-lucide-pencil"
        color="neutral"
        variant="soft"
        :disabled="!identity.canWrite.value"
        @click="editOpen = true"
      />
      <WorkspaceProjectIdentityWrite
        :identity="identity"
        :requested-open="editOpen"
        @close="editOpen = false"
      />
    </template>
    <template #selected>
      <UCard v-if="identity.selectedProject.value">
        <div class="space-y-3">
          <UAvatar
            :src="identity.imageUrl.value || undefined"
            :alt="identity.name.value"
            icon="i-lucide-briefcase-business"
            size="xl"
          />
          <h3 class="font-medium">
            {{ identity.name.value || index.selectedId.value }}
          </h3>
          <p v-if="identity.description.value" class="text-sm text-muted">
            {{ identity.description.value }}
          </p>
          <UButton
            to="/workspace/project/identity"
            label="Open identity"
            variant="link"
          />
        </div>
      </UCard>
      <p v-else-if="identity.outcome.value === 'pending'" role="status">
        Loading selected Project…
      </p>
      <UAlert
        v-else-if="identity.outcome.value === 'error'"
        color="error"
        title="Project could not be loaded"
      />
      <p v-else class="text-sm text-muted">
        Choose a Project from the collection.
      </p>
    </template>
  </WorkspaceCapability>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import WorkspaceCapability from '../../../components/Workspace/Capability.vue'
import type { ProjectPublishedIdentity } from '../../models/published-identity'
import { useWorkspaceCreation } from '../../../composables/fireux/workspace/useWorkspaceCreation'
import WorkspaceProjectCrudCreate from './Crud/Create.vue'
import WorkspaceProjectIdentityWrite from './Identity/Write.vue'
import { useProjectWorkspaceIdentity } from '../../composables/workspace/identity/useProjectWorkspaceIdentity'
import { useProjectWorkspaceIndex } from '../../composables/workspace/index/useProjectWorkspaceIndex'

const props = defineProps<{ publication?: ProjectPublishedIdentity | null }>()
import { useWorkspacePageState } from '../../../composables/fireux/workspace/useWorkspacePageState'

const creation = useWorkspaceCreation('project')
const index = useProjectWorkspaceIndex()
const identity = useProjectWorkspaceIdentity({
  publication: computed(() => props.publication),
})
const createOpen = ref(false)
const editOpen = ref(false)
const pageState = useWorkspacePageState('project')
watchEffect(() =>
  pageState.publish({
    collection: {
      records: index.collection.value.map((item) => ({
        id: item.id,
        name: item.name,
        image: item.image_url,
      })),
    },
    selected: identity.selectedProject.value
      ? {
          id: index.selectedId.value,
          name: identity.name.value,
          image: identity.imageUrl.value,
          description: identity.description.value,
        }
      : null,
    derived: {
      status: index.outcome.value,
      canCreate: creation.canCreate.value,
      canUpdate: identity.canWrite.value,
    },
  })
)
</script>
