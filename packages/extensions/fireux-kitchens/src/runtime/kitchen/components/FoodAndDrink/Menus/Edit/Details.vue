<template>
  <section
    v-if="menu"
    :key="menu.id"
    class="menu-editor"
    aria-label="Menu details"
  >
    <div class="menu-settings-fields">
      <FireFormsEditableSimpleField
        label="Name"
        :value="menu.name"
        :maxlength="120"
        :disabled="!canRename"
        :disabled-message="
          canWrite
            ? 'Plus is required to rename a Menu.'
            : 'This Menu is read-only.'
        "
        :validation-function="validateName"
        :update="rename"
      />
      <UButton
        v-if="canWrite && !canRename"
        to="/pricing"
        label="Upgrade to rename"
        color="neutral"
        variant="link"
        class="menu-settings-fields__upgrade"
      />
      <FireFormsEditableSimpleField
        label="Internal name (optional)"
        :value="menu.internal_name || ''"
        :maxlength="160"
        :disabled="!canWrite"
        disabled-message="This Menu is read-only."
        :update="updateInternalName"
      />
      <p class="fx-type-caption">Only shown in Workspace.</p>
      <FireFormsEditableSimpleField
        label="Description"
        :value="menu.description"
        type="textarea"
        :rows="3"
        :maxlength="500"
        :disabled="!canWrite"
        disabled-message="This Menu is read-only."
        :update="updateDescription"
      />
      <FireFormsEditableSimpleField
        label="Display order"
        :value="menu.sort_order"
        type="number"
        :disabled="!canWrite"
        disabled-message="This Menu is read-only."
        :validation-function="validateOrder"
        :update="updateOrder"
      />
      <p class="fx-type-caption">Lower numbers appear first.</p>
    </div>
  </section>
</template>
<script setup lang="ts">
import { useKitchenMenuRecordContext } from '../../../../composables/workspace/menus/useKitchenMenuRecordContext'
import { useMenuRecordMetadata } from '../../../../composables/workspace/menus/useMenuRecordMetadata'
const {
  menu,
  canWrite,
  canRename,
  validateName,
  validateOrder,
  rename,
  updateInternalName,
  updateDescription,
  updateOrder,
} = useMenuRecordMetadata(useKitchenMenuRecordContext())
</script>
<style scoped>
.menu-editor {
  padding: clamp(1rem, 2vw, 1.5rem);
  min-width: 0;
}
.menu-settings-fields {
  display: grid;
  gap: calc(var(--spacing) * 4);
}
.menu-settings-fields__upgrade {
  justify-self: start;
  padding: 0;
}
</style>
