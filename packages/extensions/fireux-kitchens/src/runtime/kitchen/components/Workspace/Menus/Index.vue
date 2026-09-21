<template>
  <section v-if="kitchenId" class="grid gap-4" aria-label="Menus">
    <MenusCollection />
  </section>
  <UAlert
    v-else
    color="neutral"
    variant="soft"
    title="Choose a kitchen"
    :actions="[{ label: 'Choose kitchen', to: workspaceEntryPath }]"
  />
</template>
<script setup lang="ts">
import { useWorkspaceEntryCta } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceEntryCta'
import { useKitchenMenusContext } from '../../../composables/workspace/menus/useKitchenMenusContext'
import MenusCollection from './Collection.vue'
const { workspaceEntryPath } = useWorkspaceEntryCta('kitchen')
const { kitchenId } = useKitchenMenusContext()
</script>
