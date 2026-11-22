<template>
  <KitchenItems
    v-if="kitchen"
    :key="JSON.stringify([kitchen.id, dishId])"
    :kitchen-id="kitchen.id"
    :dish-id="dishId"
  />
  <template v-else>
    <WorkspacePageHeader title="Items">
      <template #actions>
        <UButton variant="ghost" to="/workspace/kitchen"
          >Back to Kitchen</UButton
        >
      </template>
    </WorkspacePageHeader>
    <FireState
      v-if="outcome === 'pending' || outcome === 'error'"
      :outcome="outcome"
      entity="Kitchen"
      :error="access.error.value || source.error.value"
    />
    <p v-else>Open an accessible Kitchen to manage Items.</p>
  </template>
</template>

<script setup lang="ts">
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import KitchenItems from '../components/Workspace/Items/Index.vue'
import { useKitchenOnlyWorkspace } from '../composables/workspace/useKitchenOnlyWorkspace'

definePageMeta({
  layout: 'workspace',
  workspace: 'kitchen',
  workspaceSurface: 'browse',
  requiresAuth: true,
  requiresSelection: false,
})

const dishId = useRouteParam('dishId')
const { data: kitchen, outcome, access, source } = useKitchenOnlyWorkspace()
</script>
