<template>
  <WorkspaceKitchenOperationsMenusAi />
</template>

<script setup lang="ts">
import { provideKitchenMenusWorkspace } from 'fireux-kitchens/runtime/kitchen/composables/workspace/operations/Menus/useKitchenMenusWorkspace'

provideKitchenMenusWorkspace()
</script>
