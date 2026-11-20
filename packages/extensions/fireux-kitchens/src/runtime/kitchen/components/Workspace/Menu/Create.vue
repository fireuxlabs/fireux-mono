<template>
  <UModal
    v-model:open="createOpen"
    title="Create Menu"
    description="Upload a PDF or photos, paste a menu URL, or start blank."
    class="menu-editor-dialog menu-editor-dialog--create"
  >
    <template #body><KitchenWorkspaceMenuMenusCreate /></template>
  </UModal>
</template>
<script setup lang="ts">
import { useKitchenMenus } from '../../../composables/workspace/menu/menus/useKitchenWorkspaceMenus'
const { dialogs } = useKitchenMenus()
const { createOpen } = dialogs
</script>
