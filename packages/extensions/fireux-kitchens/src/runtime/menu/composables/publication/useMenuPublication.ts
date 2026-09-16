import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'

export function useMenuPublication() {
  const { currentUser } = useAuth()

  async function publishMenu(kitchenId: string, menuId: string) {
    const token = await currentUser.value?.getIdToken()
    if (!token) throw new Error('Sign in before publishing this Menu.')
    await $fetch('/api/workspace/kitchen/menus/publish', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { kitchenId, menuId },
    })
  }

  async function unpublishMenu(kitchenId: string, menuId: string) {
    const token = await currentUser.value?.getIdToken()
    if (!token) throw new Error('Sign in before unpublishing this menu.')
    await $fetch('/api/workspace/kitchen/menus/unpublish', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { kitchenId, menuId },
    })
  }

  async function archiveMenu(kitchenId: string, menuId: string) {
    const token = await currentUser.value?.getIdToken()
    if (!token) throw new Error('Sign in before archiving this Menu.')
    await $fetch('/api/workspace/kitchen/menus/archive', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { kitchenId, menuId },
    })
  }

  return { publishMenu, unpublishMenu, archiveMenu }
}
