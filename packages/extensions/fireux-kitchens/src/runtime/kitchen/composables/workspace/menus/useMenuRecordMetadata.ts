import { computed } from 'vue'
import type { MenuUpdateInput } from '../../../../menu/models/menu-storage.model'
import { useMenuEditorScope } from '../../../../menu/composables/useMenuEditorScope'
import type { useKitchenMenuRecordContext } from './useKitchenMenuRecordContext'

export function useMenuRecordMetadata(
  context: Pick<
    ReturnType<typeof useKitchenMenuRecordContext>,
    | 'menu'
    | 'menuId'
    | 'menuSlug'
    | 'kitchenId'
    | 'canWrite'
    | 'subscription'
    | 'updateMenu'
    | 'renameMenu'
  >
) {
  const {
    menu,
    menuId,
    menuSlug,
    kitchenId,
    canWrite,
    subscription,
    updateMenu,
    renameMenu,
  } = context
  const captureIntent = useMenuEditorScope([
    kitchenId,
    menuId,
    menuSlug,
    canWrite,
  ])
  const canRename = computed(
    () => canWrite.value && ['pro', 'business'].includes(subscription.value)
  )
  const validateName = (value: string) => ({
    isValid: Boolean(value.trim()),
    message: 'Menu name is required.',
  })
  const validateOrder = (value: string) => ({
    isValid: Boolean(value.trim()) && Number.isSafeInteger(Number(value)),
    message: 'Enter a whole number.',
  })
  async function rename(name: string, isCurrent = captureIntent()) {
    if (!canRename.value || !menuId.value)
      throw new Error(
        'Pro and Kitchen write access are required to rename a Menu.'
      )
    try {
      await renameMenu(kitchenId.value, menuId.value, name.trim(), isCurrent)
    } catch (error) {
      if (!isCurrent()) return
      throw error
    }
  }
  async function update(changes: MenuUpdateInput, isCurrent = captureIntent()) {
    if (!canWrite.value || !menuId.value)
      throw new Error('This Menu is read-only.')
    try {
      await updateMenu(kitchenId.value, menuId.value, changes, isCurrent)
    } catch (error) {
      if (!isCurrent()) return
      throw error
    }
  }
  function updateInternalName(value: string, isCurrent?: () => boolean) {
    return update({ internal_name: value.trim() }, isCurrent)
  }
  function updateDescription(value: string, isCurrent?: () => boolean) {
    return update({ description: value.trim() }, isCurrent)
  }
  async function updateOrder(value: string, isCurrent?: () => boolean) {
    if (!validateOrder(value).isValid) throw new Error('Enter a whole number.')
    await update({ sort_order: Number(value) }, isCurrent)
  }
  return {
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
  }
}
