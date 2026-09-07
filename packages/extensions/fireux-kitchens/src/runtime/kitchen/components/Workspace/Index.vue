<template>
  <WorkspaceCapability
    collection-label="Kitchens"
    aria-label="Kitchen workspace"
  >
    <template #collection-panel>
      <WorkspaceKitchenLandingCollection
        :index="index"
        :can-create="creation.canCreate.value"
      />
    </template>
    <template #selected-panel>
      <WorkspaceKitchenLandingIndividual
        :selected="selected"
        :can-update="workspace.outcome.value === 'ready'"
      />
    </template>
  </WorkspaceCapability>
</template>

<script setup lang="ts">
import WorkspaceKitchenLandingCollection from './Landing/Collection.vue'
import WorkspaceKitchenLandingIndividual from './Landing/Individual.vue'
import { computed, watchEffect } from 'vue'
import WorkspaceCapability from 'fireux-core/runtime/components/Workspace/Capability.vue'
import { useWorkspaceCreation } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceCreation'
import { useKitchenWorkspace } from '../../composables/workspace/core/useKitchenWorkspace'
import { useKitchenWorkspaceIndex } from '../../composables/workspace/index/useKitchenWorkspaceIndex'

import { useWorkspacePageState } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspacePageState'

const creation = useWorkspaceCreation('kitchen')
const workspace = useKitchenWorkspace()
const index = useKitchenWorkspaceIndex()
const selected = computed(() =>
  index.collection.value.find((item) => item.id === index.selectedId.value)
)
const pageState = useWorkspacePageState('kitchen')
watchEffect(() =>
  pageState.publish({
    collection: {
      records: index.collection.value.map((item) => ({
        id: item.id,
        name: item.display_name,
        image: item.display_image_url,
      })),
    },
    selected: selected.value
      ? {
          id: selected.value.id,
          name: selected.value.display_name,
          image: selected.value.display_image_url,
          description: selected.value.tagline,
          slug: workspace.data.value?.slug,
          status: workspace.data.value?.status,
          visibility: workspace.data.value?.visibility,
        }
      : null,
    derived: {
      status: index.outcome.value,
      canCreate: creation.canCreate.value,
      canUpdate: Boolean(selected.value && workspace.outcome.value === 'ready'),
    },
  })
)
</script>
