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
import { useRouter } from '#imports'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { useKitchenMenuRecordContext } from '../../../../composables/workspace/menus/useKitchenMenuRecordContext'
const { menu, menuId, menuSlug, kitchenId, canWrite, subscription, updateMenu, renameMenu } = useKitchenMenuRecordContext()
const router = useRouter()
const toast = useToastify()
const canRename = computed(() => canWrite.value && ['premium', 'business'].includes(subscription.value))
const validateName = (value: string) => ({ isValid: Boolean(value.trim()), message: 'Menu name is required.' })
const validateOrder = (value: string) => ({ isValid: Boolean(value.trim()) && Number.isSafeInteger(Number(value)), message: 'Enter a whole number.' })
async function rename(name: string) {
  if (!canRename.value || !menuId.value) throw new Error('Plus and Kitchen write access are required to rename a Menu.')
  const targetKitchen = kitchenId.value
  const targetId = menuId.value
  const previousSlug = menuSlug.value
  const result = await renameMenu(targetKitchen, targetId, name.trim())
  if (kitchenId.value !== targetKitchen || menuSlug.value !== previousSlug) return
  await router.replace(`/workspace/kitchen/menus/${encodeURIComponent(result.slug)}`)
  toast.add({ title: 'Menu renamed', description: 'The Menu address has been updated.', color: 'success', icon: 'i-lucide-check' })
}
async function updateDescription(value: string) {
  if (!canWrite.value || !menuId.value) throw new Error('This Menu is read-only.')
  await updateMenu(kitchenId.value, menuId.value, { description: value.trim() })
}
async function updateOrder(value: string) {
  if (!canWrite.value || !menuId.value) throw new Error('This Menu is read-only.')
  if (!validateOrder(value).isValid) throw new Error('Enter a whole number.')
  await updateMenu(kitchenId.value, menuId.value, { sort_order: Number(value) })
}
</script>
<style scoped>
.menu-editor { padding: clamp(1rem, 2vw, 1.5rem); min-width: 0; }
.menu-settings-fields { display: grid; gap: calc(var(--spacing) * 4); }
.menu-settings-fields__upgrade { justify-self: start; padding: 0; }
</style>
