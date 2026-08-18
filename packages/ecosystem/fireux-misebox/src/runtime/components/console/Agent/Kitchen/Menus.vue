<template>
  <ConsoleKitchenOperationsMenusAi />
</template>

<script setup lang="ts">
import { provideKitchenMenusWorkspace } from 'fireux-kitchens/runtime/kitchen/composables/console/operations/Menus/useKitchenMenusWorkspace'

provideKitchenMenusWorkspace()
</script>
