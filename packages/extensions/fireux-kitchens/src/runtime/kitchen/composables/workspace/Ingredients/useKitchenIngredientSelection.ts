import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useWorkspaceWriteGuard } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceWriteGuard'
import { useKitchenWorkspace } from '../useKitchenWorkspace'
import { useKitchenAccess } from '../../useKitchenAccess'

export function useKitchenIngredientSelection() {
  const { requireWritableData } = useWorkspaceWriteGuard('kitchen')
  const { currentUser } = useAuth()
  const workspace = useKitchenWorkspace()
  const access = useKitchenAccess()
  async function command(
    action: 'create' | 'delete',
    kitchenId: string,
    ingredientId: string,
    options: { kitchenCollectionPath: string }
  ) {
    requireWritableData()
    const uid = currentUser.value?.uid
    const allowed = () =>
      Boolean(
        uid &&
          currentUser.value?.uid === uid &&
          workspace.id.value === kitchenId &&
          access.ids.value.includes(kitchenId) &&
          options.kitchenCollectionPath === 'kitchens'
      )
    if (!allowed()) throw new Error('This Kitchen is read-only.')
    const token = await currentUser.value?.getIdToken()
    if (!token || !allowed())
      throw new Error('The account or Kitchen changed. Try again.')
    await $fetch(`/api/workspace/kitchen/ingredients/${action}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { kitchenId, ingredientId },
    })
    return ingredientId
  }
  return {
    selectIngredient: (
      kitchenId: string,
      ingredientId: string,
      options: { kitchenCollectionPath: string }
    ) => command('create', kitchenId, ingredientId, options),
    unselectIngredient: (
      kitchenId: string,
      ingredientId: string,
      options: { kitchenCollectionPath: string }
    ) => command('delete', kitchenId, ingredientId, options),
  }
}
