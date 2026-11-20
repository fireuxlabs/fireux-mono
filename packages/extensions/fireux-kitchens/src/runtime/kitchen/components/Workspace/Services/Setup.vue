<template>
  <div class="service-config">
    <div class="service-fields">
      <WorkspaceKitchenServicesSetupKiosk v-if="option.key === 'counter'" />
      <WorkspaceKitchenServicesSetupMenus
        v-else
        :menu-ids="editor.menuIds"
        :menus="menus"
        :outcome="workspace.source.menusOutcome.value"
        :disabled="disabled"
        @update="editor.setMenus"
      />
      <WorkspaceKitchenServicesSetupServiceHours
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
          <WorkspaceKitchenServicesSetupMenuWindows
            :menus="menus.filter((menu) => editor.menuIds.includes(menu.id))"
            :service-hours="hours"
          />
        </template>
      </WorkspaceKitchenServicesSetupServiceHours>
    </div>
    <p v-if="!editor.sameAsKitchen && !editor.hours?.windows.length">
      Add serving hours or use Kitchen service hours.
    </p>
    <WorkspaceKitchenServicesSetupPreOrder v-if="option.key === 'pre_order'" />
  </div>
</template>
<script setup lang="ts">
import { useKitchenServiceEditor } from '../../../composables/workspace/services/useKitchenServiceEditor'
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
