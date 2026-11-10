<template>
  <div class="kiosk-setup">
    <KitchenMenuServicesSetupInteraction
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
    <UButton
      v-if="kioskPath"
      :to="kioskPath"
      target="_blank"
      label="Open Kiosk"
      icon="i-lucide-monitor"
      color="neutral"
      variant="soft"
    />
    <p class="kiosk-setup__note">
      Use a guest browser on the touchscreen. Orders go to your order board;
      payment is handled at the counter.
    </p>
  </div>
</template>
<script setup lang="ts">
import { useKitchenServiceEditor } from '../../../../composables/offerings/useKitchenServiceEditor'
import { kitchenOrderTypeLabel } from '../../../../utils/kitchen-order-label'
import { computed } from 'vue'
const { editor, services, disabled, menus, workspace } =
  useKitchenServiceEditor()
const kioskMenus = computed(() =>
  services.value.length > 1
    ? menus.value.filter((menu) => editor.menuIds.includes(menu.id))
    : menus.value
)
const kioskPath = computed(() => {
  const slug = workspace.source.selectedKitchen.value?.identity?.slug
  return slug ? `/kitchens/${encodeURIComponent(slug)}/menu.kiosk` : ''
})
</script>
<style scoped>
.kiosk-setup {
  display: grid;
  gap: 1rem;
}
.kiosk-setup__note {
  color: var(--ui-text-muted);
  font-size: 0.875rem;
}
</style>
