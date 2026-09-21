import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
export function useMenuSchedule() {
  const { currentUser } = useAuth()
  async function configure(input: {
    kitchenId: string
    menuId: string
    schedule?: 'regular' | 'daily'
    date?: string
    label?: string
    copyFrom?: string
  }) {
    const token = await currentUser.value?.getIdToken()
    if (!token) throw new Error('Sign in to edit this menu.')
    return $fetch<{ ok: boolean; sectionId?: string }>(
      '/api/workspace/kitchen/menus/schedule',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: input,
      }
    )
  }
  return { configure }
}
