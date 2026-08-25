<template>
  <WorkspaceKitchenMenusAi />
</template>

<script setup lang="ts">
import { provideKitchenMenusWorkspace } from 'fireux-kitchens/runtime/kitchen/composables/workspace/Menus/useKitchenMenusWorkspace'

provideKitchenMenusWorkspace()
</script>
