<template>
  <section class="console-surface space-y-6">
    <ConsoleKitchenOperationsMenusWorkspaceHeader />

    <ConsoleKitchenOperationsMenusEditDetails v-if="menu" />

    <UAlert
      v-else-if="source"
      color="neutral"
      variant="soft"
      icon="i-lucide-file-scan"
      title="This source has not become a Menu yet"
      description="Open Source to process the saved document into a review draft."
      :actions="sourceActions"
    />

    <UAlert
      v-else
      color="warning"
      variant="soft"
      icon="i-lucide-triangle-alert"
      title="Menu unavailable"
      description="Return to Menus and choose an existing Menu."
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenConsoleMenu } from '../../../../../composables/fireux/console/kitchen/operations/Menus/useKitchenConsoleMenu'

const {
  menu,
  source,
  menuId,
} = useKitchenConsoleMenu()
const sourceActions = computed(() => [{
  label: 'Open Source',
  icon: 'i-lucide-arrow-right',
  to: `/console/kitchen/menus/${encodeURIComponent(menuId.value)}/source`,
}])
</script>
