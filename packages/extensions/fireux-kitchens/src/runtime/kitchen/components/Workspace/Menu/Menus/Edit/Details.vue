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
            ? 'Pro is required to rename a Menu.'
            : 'This Menu is read-only.'
        "
        :validation-function="validateName"
        :capture-intent="captureIntent"
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
        :capture-intent="captureIntent"
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
        :capture-intent="captureIntent"
        :update="updateDescription"
      />
      <FireFormsEditableSimpleField
        label="Display order"
        :value="menu.sort_order"
        type="number"
        :disabled="!canWrite"
        disabled-message="This Menu is read-only."
        :validation-function="validateOrder"
        :capture-intent="captureIntent"
        :update="updateOrder"
      />
      <p class="fx-type-caption">Lower numbers appear first.</p>
      <UFormField label="Menu colours">
        <USelect
          :model-value="menu.theme_mode"
          placeholder="Inherited Kitchen colours"
          :items="themeOptions"
          :disabled="!canWrite || changingTheme"
          @update:model-value="saveTheme"
        />
      </UFormField>
      <p v-if="themeError" role="alert">{{ themeError }}</p>
    </div>
  </section>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useKitchenMenuRecordContext } from '../../../../../composables/workspace/menu/menus/useKitchenMenuRecordContext'
import { useMenuRecordMetadata } from '../../../../../composables/workspace/menu/menus/useMenuRecordMetadata'
const {
  menu,
  canWrite,
  canRename,
  captureIntent,
  validateName,
  validateOrder,
  rename,
  updateInternalName,
  updateDescription,
  updateOrder,
  updateThemeMode,
} = useMenuRecordMetadata(useKitchenMenuRecordContext())
const themeOptions = [
  { label: 'Kitchen colours', value: 'kitchen' },
  { label: 'Misebox default', value: 'default' },
] satisfies Array<{ label: string; value: 'kitchen' | 'default' }>
const changingTheme = ref(false)
const themeError = ref('')
async function saveTheme(value: 'kitchen' | 'default') {
  if (changingTheme.value || !canWrite.value) return
  changingTheme.value = true
  themeError.value = ''
  try {
    await updateThemeMode(value)
  } catch (error) {
    themeError.value =
      error instanceof Error ? error.message : 'Could not save Menu colours.'
  } finally {
    changingTheme.value = false
  }
}
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
