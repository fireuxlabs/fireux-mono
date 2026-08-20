<template>
  <section v-if="canWrite" aria-labelledby="create-menu-title">
    <h2 id="create-menu-title" class="sr-only">Create menu</h2>
    <UButton
      to="/workspace/kitchen/menus/create"
      color="neutral"
      variant="soft"
      icon="i-lucide-plus"
    >
      Create menu
    </UButton>
  </section>
</template>

<script setup lang="ts">
import { useKitchenMenusWorkspace } from '../../../../composables/workspace/operations/Menus/useKitchenMenusWorkspace'

const { canWrite } = useKitchenMenusWorkspace()
</script>
