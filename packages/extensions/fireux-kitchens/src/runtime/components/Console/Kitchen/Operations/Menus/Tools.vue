<template>
  <UCard v-if="canWrite" aria-labelledby="create-menu-title">
    <template #header>
      <div>
        <h2 id="create-menu-title" class="text-sm font-semibold text-highlighted">
          Tools
        </h2>
        <p class="mt-1 text-sm text-muted">
          Create a Menu from a URL, photo, or PDF source.
        </p>
      </div>
    </template>

    <UButton to="/console/kitchen/menus/create" icon="i-lucide-plus">
      Create menu
    </UButton>
  </UCard>
</template>

<script setup lang="ts">
import { useKitchenMenusWorkspace } from '../../../../../composables/fireux/console/kitchen/operations/Menus/useKitchenMenusWorkspace'

const { canWrite } = useKitchenMenusWorkspace()
</script>
