<template>
  <div class="service-config space-y-4">
    <div class="service-fields">
      <WorkspaceKitchenOfferingsSetupKiosk v-if="option.key === 'counter'" />
      <WorkspaceKitchenOfferingsSetupMenus
        v-else
        :menu-ids="editor.menuIds"
        :menus="menus"
        :outcome="workspace.source.menusOutcome.value"
        :disabled="disabled"
        @update="editor.setMenus"
      />
      <WorkspaceKitchenOfferingsSetupServiceHours
        :same-as-kitchen="editor.sameAsKitchen"
        :kitchen-hours="kitchenHours"
        :value="editor.hours"
        :timezone="editor.timezone"
        label="Serving hours"
        :disabled="disabled"
        @update="editor.setHours"
        @inherit="editor.setSameAsKitchen"
      >
        <template #menus="{ hours }">
          <WorkspaceKitchenOfferingsSetupMenuWindows
            :menus="menus.filter((menu) => editor.menuIds.includes(menu.id))"
            :service-hours="hours"
          />
        </template>
      </WorkspaceKitchenOfferingsSetupServiceHours>
    </div>
    <p
      v-if="!editor.sameAsKitchen && !editor.hours?.windows.length"
      class="text-sm text-muted"
    >
      Add serving hours or use Kitchen service hours.
    </p>
    <WorkspaceKitchenOfferingsSetupPreOrder v-if="option.key === 'pre_order'" />
  </div>
</template>
<script setup lang="ts">
import { useKitchenServiceEditor } from '../../../composables/offerings/useKitchenServiceEditor'
const { option, workspace, editor, menus, kitchenHours, disabled } =
  useKitchenServiceEditor()
</script>
<style scoped>
.service-config {
  padding-block: 0.25rem;
}
.service-fields {
  display: grid;
  align-items: start;
  gap: 1rem;
}
@media (min-width: 768px) {
  .service-fields {
    grid-template-columns: minmax(0, 1fr) minmax(17rem, 0.8fr);
  }
}
</style>
