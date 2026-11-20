<template>
  <div class="kiosk-setup">
    <WorkspaceKitchenServicesSetupInteraction
      v-for="config in editor.interactions"
      :key="config.type"
      :label="kitchenOrderTypeLabel(config.type)"
      :config="config"
      :mode-menus="true"
      :disabled="disabled"
      :menus="kioskMenus"
      :menus-outcome="workspace.source.menusOutcome.value"
      :update-function="
        (changes) => editor.updateInteraction(config.type, changes)
      "
    />
  </div>
</template>
<script setup lang="ts">
import { useKitchenServiceEditor } from '../../../../composables/workspace/services/useKitchenServiceEditor'
import { kitchenOrderTypeLabel } from '../../../../utils/kitchen-order-label'
import { computed } from 'vue'
const { editor, services, disabled, menus, workspace } =
  useKitchenServiceEditor()
const kioskMenus = computed(() =>
  services.value.length > 1
    ? menus.value.filter((menu) => editor.menuIds.includes(menu.id))
    : menus.value
)
</script>
<style scoped>
.kiosk-setup {
  display: grid;
  gap: 1rem;
}
</style>
