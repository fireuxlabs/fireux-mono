import { computed } from 'vue'
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
  const captureScope = useMenuEditorScope([kitchenId, menuId, menuSlug])
  const canRename = computed(
    () => canWrite.value && ['premium', 'business'].includes(subscription.value)
  )
  const validateName = (value: string) => ({
    isValid: Boolean(value.trim()),
    message: 'Menu name is required.',
  })
  const validateOrder = (value: string) => ({
    isValid: Boolean(value.trim()) && Number.isSafeInteger(Number(value)),
    message: 'Enter a whole number.',
  })
  async function rename(name: string) {
    if (!canRename.value || !menuId.value)
      throw new Error(
        'Plus and Kitchen write access are required to rename a Menu.'
      )
    const targetKitchen = kitchenId.value
    const targetId = menuId.value
    const isCurrent = captureScope()
    try {
      await renameMenu(targetKitchen, targetId, name.trim())
    } catch (error) {
      if (!isCurrent()) return
      throw error
    }
  }
  async function updateInternalName(value: string) {
    if (!canWrite.value || !menuId.value)
      throw new Error('This Menu is read-only.')
    const isCurrent = captureScope()
    try {
      await updateMenu(kitchenId.value, menuId.value, {
        internal_name: value.trim(),
      })
    } catch (error) {
      if (!isCurrent()) return
      throw error
    }
  }
  async function updateDescription(value: string) {
    if (!canWrite.value || !menuId.value)
      throw new Error('This Menu is read-only.')
    const isCurrent = captureScope()
    try {
      await updateMenu(kitchenId.value, menuId.value, {
        description: value.trim(),
      })
    } catch (error) {
      if (!isCurrent()) return
      throw error
    }
  }
  async function updateOrder(value: string) {
    if (!canWrite.value || !menuId.value)
      throw new Error('This Menu is read-only.')
    if (!validateOrder(value).isValid) throw new Error('Enter a whole number.')
    const isCurrent = captureScope()
    try {
      await updateMenu(kitchenId.value, menuId.value, {
        sort_order: Number(value),
      })
    } catch (error) {
      if (!isCurrent()) return
      throw error
    }
  }
  return {
    menu,
    canWrite,
    canRename,
    validateName,
    validateOrder,
    rename,
    updateInternalName,
    updateDescription,
    updateOrder,
  }
}
