<template>
  <WorkspaceCapability
    collection-label="Projects"
    aria-label="Project workspace"
  >
    <template #collection-panel>
      <WorkspaceProjectLandingCollection
        :index="index"
        :can-create="creation.canCreate.value"
      />
    </template>
    <template #selected-panel>
      <WorkspaceProjectLandingIndividual :identity="identity" />
    </template>
  </WorkspaceCapability>
</template>

<script setup lang="ts">
import WorkspaceProjectLandingCollection from './Landing/Collection.vue'
import WorkspaceProjectLandingIndividual from './Landing/Individual.vue'
import { computed, watchEffect } from 'vue'
import WorkspaceCapability from '../../../components/Workspace/Capability.vue'
import type { ProjectPublishedIdentity } from '../../models/published-identity'
import { useWorkspaceCreation } from '../../../composables/fireux/workspace/useWorkspaceCreation'
import { useProjectWorkspaceIdentity } from '../../composables/workspace/identity/useProjectWorkspaceIdentity'
import { useProjectWorkspaceIndex } from '../../composables/workspace/index/useProjectWorkspaceIndex'

const props = defineProps<{ publication?: ProjectPublishedIdentity | null }>()
import { useWorkspacePageState } from '../../../composables/fireux/workspace/useWorkspacePageState'

const creation = useWorkspaceCreation('project')
const index = useProjectWorkspaceIndex()
const identity = useProjectWorkspaceIdentity({
  publication: computed(() => props.publication),
})
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
