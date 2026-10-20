<template>
  <section v-if="menu" :key="menu.id" class="menu-editor" aria-label="Menu details">
    <div class="menu-settings-fields">
      <MoleculesFormsEditableSimpleField
        label="Name"
        :value="menu.name"
        :maxlength="120"
        :disabled="!canRename"
        :disabled-message="canWrite ? 'Plus is required to rename a Menu.' : 'This Menu is read-only.'"
        :validation-function="validateName"
        :update="rename"
      />
      <UButton v-if="canWrite && !canRename" to="/pricing" label="Upgrade to rename" color="neutral" variant="link" class="menu-settings-fields__upgrade" />
      <MoleculesFormsEditableSimpleField
        label="Internal name (optional)"
        :value="menu.internal_name || ''"
        :maxlength="160"
        :disabled="!canWrite"
        disabled-message="This Menu is read-only."
        :update="updateInternalName"
      />
      <p class="fx-type-caption">Only shown in Workspace.</p>
      <MoleculesFormsEditableSimpleField
        label="Description"
        :value="menu.description"
        type="textarea"
        :rows="3"
        :maxlength="500"
        :disabled="!canWrite"
        disabled-message="This Menu is read-only."
        :update="updateDescription"
      />
      <MoleculesFormsEditableSimpleField
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
import { computed } from 'vue'
import { useMenuEditorScope } from '../../../../../menu/composables/useMenuEditorScope'
import { useKitchenMenuRecordContext } from '../../../../composables/workspace/menus/useKitchenMenuRecordContext'
const { menu, menuId, menuSlug, kitchenId, canWrite, subscription, updateMenu, renameMenu } = useKitchenMenuRecordContext()
const captureScope = useMenuEditorScope([kitchenId, menuId, menuSlug])
const canRename = computed(() => canWrite.value && ['premium', 'business'].includes(subscription.value))
const validateName = (value: string) => ({ isValid: Boolean(value.trim()), message: 'Menu name is required.' })
const validateOrder = (value: string) => ({ isValid: Boolean(value.trim()) && Number.isSafeInteger(Number(value)), message: 'Enter a whole number.' })
async function rename(name: string) {
  if (!canRename.value || !menuId.value) throw new Error('Plus and Kitchen write access are required to rename a Menu.')
  const targetKitchen = kitchenId.value
  const targetId = menuId.value
  const isCurrent = captureScope()
  try { await renameMenu(targetKitchen, targetId, name.trim()) }
  catch (error) { if (!isCurrent()) return; throw error }

}
async function updateInternalName(value: string) {
  if (!canWrite.value || !menuId.value) throw new Error('This Menu is read-only.')
  const isCurrent = captureScope()
  try { await updateMenu(kitchenId.value, menuId.value, { internal_name: value.trim() }) }
  catch (error) { if (!isCurrent()) return; throw error }
}
async function updateDescription(value: string) {
  if (!canWrite.value || !menuId.value) throw new Error('This Menu is read-only.')
  const isCurrent = captureScope()
  try { await updateMenu(kitchenId.value, menuId.value, { description: value.trim() }) }
  catch (error) { if (!isCurrent()) return; throw error }
}
async function updateOrder(value: string) {
  if (!canWrite.value || !menuId.value) throw new Error('This Menu is read-only.')
  if (!validateOrder(value).isValid) throw new Error('Enter a whole number.')
  const isCurrent = captureScope()
  try { await updateMenu(kitchenId.value, menuId.value, { sort_order: Number(value) }) }
  catch (error) { if (!isCurrent()) return; throw error }
}
</script>
<style scoped>
.menu-editor { padding: clamp(1rem, 2vw, 1.5rem); min-width: 0; }
.menu-settings-fields { display: grid; gap: calc(var(--spacing) * 4); }
.menu-settings-fields__upgrade { justify-self: start; padding: 0; }
</style>
