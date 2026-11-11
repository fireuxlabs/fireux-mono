import type { WatchSource } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestore-document-id'
import { useDishEditorScope } from '../../dish/useDishEditorScope'

export function useKitchenItemGroupCommands(sources: WatchSource[]) {
  const { currentUser } = useAuth()
  const capture = useDishEditorScope(sources)
  async function save(
    input: {
      kitchenId: string
      groupId?: string
      name: string
      active?: boolean
      default_station_ids?: string[]
    },
    isOwnerCurrent: () => boolean
  ) {
    const body = JSON.parse(JSON.stringify(input))
    const current = capture(),
      uid = currentUser.value?.uid
    const assertCurrent = () => {
      if (
        !uid ||
        currentUser.value?.uid !== uid ||
        !current() ||
        !isOwnerCurrent()
      )
        throw new Error('The Item group editor changed. Try again.')
    }
    assertCurrent()
    const user = await useRequireUser()
    assertCurrent()
    if (user.uid !== uid) throw new Error('The account changed. Try again.')
    const token = await user.getIdToken()
    assertCurrent()
    const result = await $fetch<{ id: string }>(
      '/api/workspace/kitchen/item-groups',
      {
        method: body.groupId ? 'PATCH' : 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body,
        retry: 0,
      }
    )
    if (
      !isFirestoreDocumentId(result?.id) ||
      (body.groupId && result.id !== body.groupId)
    )
      throw new Error('Group response did not identify the requested record.')
    return result
  }
  return { save }
}
