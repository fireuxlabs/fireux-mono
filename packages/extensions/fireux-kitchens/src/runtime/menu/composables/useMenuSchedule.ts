import { useMenuMutation } from './firestore/mutations/useMenuMutation'
export function useMenuSchedule() {
  const { mutate } = useMenuMutation()
  async function configure(input: { kitchenId: string; menuId: string; schedule?: 'regular' | 'daily'; date?: string; label?: string; copyFrom?: string }) {
    return mutate<{ ok: boolean; sectionId?: string }>('schedule', 'POST', input)
  }
  return { configure }
}
