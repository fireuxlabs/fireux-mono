import { refreshNuxtData } from 'nuxt/app'
import { $fetch } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useMenuEditorScope } from '../../useMenuEditorScope'

/** Capture one Menu command before credentials; never retarget pending intent. */
export function useMenuMutation() {
  const { currentUser } = useAuth()
  const captureScope = useMenuEditorScope([])
  async function mutate<T>(
    endpoint: string,
    method: 'POST' | 'PATCH' | 'DELETE',
    input: Record<string, unknown>,
    intentCurrent: () => boolean = () => true
  ) {
    const body = JSON.parse(JSON.stringify(input))
    if (!String(body.kitchenId || '').trim())
      throw new Error('Kitchen and Menu targets are required.')
    const uid = currentUser.value?.uid,
      isCurrent = captureScope()
    const assertScope = () => {
      if (
        !uid ||
        currentUser.value?.uid !== uid ||
        !isCurrent() ||
        !intentCurrent()
      )
        throw new Error('The account or Menu changed. Reopen the Menu editor.')
    }
    const user = await useRequireUser()
    assertScope()
    if (user.uid !== uid)
      throw new Error('The account changed. Reopen the Menu editor.')
    const token = await user.getIdToken()
    assertScope()
    const result = await $fetch<
      T & { kitchenId: string; menuId: string; id?: string; ok?: boolean },
      string,
      'POST' | 'PATCH' | 'DELETE'
    >(`/api/workspace/kitchen/menus${endpoint ? `/${endpoint}` : ''}`, {
      onResponse: async ({ options, response }) => {
        if (
          response.ok &&
          !['GET', 'HEAD'].includes(
            String(options.method || 'GET').toUpperCase()
          )
        )
          await refreshNuxtData()
      },
      method,
      headers: { Authorization: `Bearer ${token}` },
      body,
    })
    if (
      !result ||
      result.kitchenId !== body.kitchenId ||
      result.menuId !== body.menuId ||
      (result.ok !== true && !result.id)
    )
      throw new Error(
        'Menu response did not match the requested Kitchen and Menu.'
      )
    return result
  }
  return { mutate }
}
