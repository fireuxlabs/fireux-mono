import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'

const clean = (value: unknown) => String(value ?? '').trim()

export async function syncMenuDirectory(input: {
  kitchenId: string
  menuId: string
  previousMenuId?: string
}) {
  const kitchenId = clean(input.kitchenId)
  const menuId = clean(input.menuId)
  const previousMenuId = clean(input.previousMenuId)
  if (!kitchenId || !menuId)
    throw new Error('Kitchen and Menu ids are required.')
  const user = await useRequireUser()
  const token = await user.getIdToken()
  return $fetch<{ ok: true; root_menu_id: string }>(
    '/api/workspace/kitchen/menus/sync-directory',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        kitchenId,
        menuId,
        ...(previousMenuId ? { previousMenuId } : {}),
      },
    }
  )
}
