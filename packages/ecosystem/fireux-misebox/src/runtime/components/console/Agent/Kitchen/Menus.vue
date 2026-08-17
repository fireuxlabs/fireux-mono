<template>
  <ConsoleKitchenOperationsMenusAi />
</template>

<script setup lang="ts">
import { provideKitchenMenusWorkspace } from 'fireux-kitchens/runtime/composables/fireux/console/kitchen/operations/Menus/useKitchenMenusWorkspace'

provideKitchenMenusWorkspace()
</script>
