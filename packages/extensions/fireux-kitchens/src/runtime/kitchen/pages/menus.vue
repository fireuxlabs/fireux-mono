<template>
  <KitchenMenus
    v-if="kitchen"
    :key="JSON.stringify([kitchen.id, menuSlug])"
    :kitchen-id="kitchen.id"
    :kitchen-slug="kitchen.identity.slug"
    :menu-slug="menuSlug"
  />
  <template v-else>
    <WorkspacePageHeader title="Menus">
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
    <p v-else>Open an accessible Kitchen to manage Menus.</p>
  </template>
</template>

<script setup lang="ts">
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import KitchenMenus from '../components/Workspace/Menus/Index.vue'
import { useKitchenOnlyWorkspace } from '../composables/workspace/useKitchenOnlyWorkspace'

definePageMeta({
  layout: 'workspace',
  workspace: 'kitchen',
  workspaceSurface: 'browse',
  requiresAuth: true,
  requiresSelection: false,
})

const menuSlug = useRouteParam('menuSlug')
const { data: kitchen, outcome, access, source } = useKitchenOnlyWorkspace()
</script>
