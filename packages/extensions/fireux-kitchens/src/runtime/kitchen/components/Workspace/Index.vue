<template>
  <WorkspaceCapability
    collection-label="Kitchens"
    aria-label="Kitchen workspace"
  >
    <template #collection-tools>
      <UButton
        label="Create Kitchen"
        icon="i-lucide-plus"
        :disabled="!creation.canCreate.value"
        @click="createOpen = true"
      />
      <WorkspaceKitchenCrudCreate v-model:open="createOpen" />
    </template>
    <template #collection>
      <p v-if="index.outcome.value === 'pending'" role="status">
        Loading Kitchens…
      </p>
      <UAlert
        v-else-if="index.outcome.value === 'error'"
        color="error"
        title="Kitchens could not be loaded"
      />
      <div v-else-if="index.collection.value.length" class="grid gap-2">
        <UButton
          v-for="kitchen in index.collection.value"
          :key="kitchen.id"
          color="neutral"
          :variant="kitchen.id === index.selectedId.value ? 'soft' : 'ghost'"
          class="justify-start"
          :aria-pressed="kitchen.id === index.selectedId.value"
          @click="index.select(kitchen.id || '')"
        >
          <UAvatar
            :src="kitchen.display_image_url || undefined"
            :alt="kitchen.display_name"
            icon="i-lucide-chef-hat"
          />
          <span class="truncate">{{ kitchen.display_name || kitchen.id }}</span>
        </UButton>
      </div>
      <p v-else class="text-sm text-muted">Create a Kitchen to get started.</p>
    </template>
    <template #selected-tools>
      <UButton
        label="Edit Kitchen settings"
        icon="i-lucide-pencil"
        color="neutral"
        variant="soft"
        :disabled="!selected || workspace.outcome.value !== 'ready'"
        @click="editOpen = true"
      />
      <WorkspaceKitchenCrudUpdate v-model:open="editOpen" />
    </template>
    <template #selected>
      <UCard v-if="selected">
        <div class="space-y-3">
          <UAvatar
            :src="selected.display_image_url || undefined"
            :alt="selected.display_name"
            icon="i-lucide-chef-hat"
            size="xl"
          />
          <h3 class="font-medium">
            {{ selected.display_name || selected.id }}
          </h3>
          <p v-if="selected.tagline" class="text-sm text-muted">
            {{ selected.tagline }}
          </p>
          <UButton
            to="/workspace/kitchen/identity"
            label="Open identity"
            variant="link"
          />
        </div>
      </UCard>
      <p v-else class="text-sm text-muted">
        Choose a Kitchen from the collection.
      </p>
    </template>
  </WorkspaceCapability>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import WorkspaceCapability from 'fireux-core/runtime/components/Workspace/Capability.vue'
import { useWorkspaceCreation } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceCreation'
import WorkspaceKitchenCrudCreate from './Crud/Create.vue'
import WorkspaceKitchenCrudUpdate from './Crud/Update.vue'
import { useKitchenWorkspace } from '../../composables/workspace/core/useKitchenWorkspace'
import { useKitchenWorkspaceIndex } from '../../composables/workspace/index/useKitchenWorkspaceIndex'

import { useWorkspacePageState } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspacePageState'

const creation = useWorkspaceCreation('kitchen')
const workspace = useKitchenWorkspace()
const index = useKitchenWorkspaceIndex()
const selected = computed(() =>
  index.collection.value.find((item) => item.id === index.selectedId.value)
)
const createOpen = ref(false)
const editOpen = ref(false)
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
