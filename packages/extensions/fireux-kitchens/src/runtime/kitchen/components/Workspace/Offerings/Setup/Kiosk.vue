<template>
  <div class="space-y-4">
    <WorkspaceKitchenOfferingsSetupInteraction
      v-for="config in editor.interactions"
      :key="config.type"
      :label="kitchenOrderTypeLabel(config.type)"
      :config="config"
      :mode-menus="true"
      :disabled="disabled"
      :menus="menus"
      :menus-outcome="workspace.source.menusOutcome.value"
      :update-function="
        (changes) => editor.updateInteraction(config.type, changes)
      "
    />
  </div>
</template>
<script setup lang="ts">
import { useKitchenServiceEditor } from '../../../../composables/offerings/useKitchenServiceEditor'
import { kitchenOrderTypeLabel } from '../../../../utils/kitchen-order-label'
const { editor, disabled, menus, workspace } = useKitchenServiceEditor()
</script>
