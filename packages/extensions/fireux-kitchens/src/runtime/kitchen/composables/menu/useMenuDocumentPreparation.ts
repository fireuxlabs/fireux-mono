import { computed, ref } from 'vue'
import { useRoute, navigateTo } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useMenuEditorScope } from '../../../menu/composables/useMenuEditorScope'
import { useWorkspace } from 'fireux-core/runtime/workspace/composables/useWorkspace'
import type { MenuSourceProcessContext } from './useMenuSourceProcess'

/** Save one existing source as a document Menu; the live readers own the result. */
export function useMenuDocumentPreparation(context: MenuSourceProcessContext) {
  const { currentUser } = useAuth()
  const route = useRoute()
  const workspace = useWorkspace('kitchen')
  const name = ref('Main')
  const pending = ref(false)
  const error = ref('')
  const available = computed(
    () =>
      context.source.value?.files?.length === 1 && !context.source.value.menu_id
  )
  const menuPath = computed(() =>
    context.menu.value?.format === 'document' && context.menu.value.slug
      ? `/workspace/kitchen/menu/menus/${encodeURIComponent(context.menu.value.slug)}`
      : ''
  )
  const capture = useMenuEditorScope(
    [
      context.kitchenId,
      context.menuId,
      context.activeKitchenAppId,
      context.canWrite,
      () => context.source.value?.file_url,
      name,
      () => route.fullPath,
    ],
    () => {
      pending.value = false
      error.value = ''
    }
  )

  async function prepare() {
    if (pending.value || !available.value || !context.canWrite.value) return
    const current = capture()
    const user = currentUser.value
    const body = {
      kitchenId: context.kitchenId.value,
      sourceId: context.menuId.value,
      name: name.value,
    }
    pending.value = true
    error.value = ''
    try {
      if (!user) throw new Error('Sign in to prepare this Menu.')
      const token = await user.getIdToken()
      if (!current()) return
      const result = await $fetch<{ id: string; kitchenId: string }>(
        '/api/workspace/kitchen/menus/source-document',
        { method: 'POST', body, headers: { Authorization: `Bearer ${token}` } }
      )
      if (result.id !== body.sourceId || result.kitchenId !== body.kitchenId)
        throw new Error('The response did not identify this Menu.')
    } catch (caught) {
      if (current())
        error.value =
          caught instanceof Error
            ? caught.message
            : 'Menu preparation failed. Try again.'
    } finally {
      if (current()) pending.value = false
    }
  }
  function openMenu() {
    if (!context.canWrite.value || !menuPath.value) return
    workspace.select(context.kitchenId.value)
    return navigateTo(menuPath.value)
  }
  return { name, pending, error, available, menuPath, prepare, openMenu }
}
