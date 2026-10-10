import { computed, onScopeDispose, watch } from 'vue'
import { navigateTo, useState } from '#imports'
import { useRouter } from 'vue-router'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { menuWorkspaceDestination } from '../../../utils/menu-workspace-destination'

export type MenuRecordView = 'details' | 'content' | 'publishing' | 'source'
type MenuViewHandoff = {
  scope: string
  slug: string
  view: MenuRecordView
  at: number
}

/** One route-entry intent, in memory only. It never grants record access. */
export function useMenuRecordNavigation() {
  const session = useAppSession()
  const { selectedId } = useWorkspace('kitchen')
  const config = useFireUXConfig()
  const scope = computed(() =>
    JSON.stringify([config.appId, session.uid.value, selectedId.value])
  )
  const handoff = useState<MenuViewHandoff | null>(
    'kitchen-menu-view-handoff',
    () => null
  )

  const router = useRouter()
  onScopeDispose(
    router.afterEach((to) => {
      if (
        handoff.value &&
        to.path !== menuWorkspaceDestination({ slug: handoff.value.slug })
      ) {
        handoff.value = null
      }
    })
  )
  function clearView() {
    handoff.value = null
  }

  watch(scope, clearView, { flush: 'sync' })

  function rememberView(
    slug: string,
    view: MenuRecordView,
    event?: MouseEvent
  ) {
    if (
      event &&
      (event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey)
    )
      return
    handoff.value = { scope: scope.value, slug, view, at: Date.now() }
  }
  function entryView(slug: string) {
    const intent = handoff.value
    if (!intent) return null
    if (
      intent.scope !== scope.value ||
      intent.slug !== slug ||
      Date.now() - intent.at >= 60_000
    ) {
      clearView()
      return null
    }
    return intent.view
  }
  async function openView(slug: string, view: MenuRecordView, replace = false) {
    rememberView(slug, view)
    return navigateTo(menuWorkspaceDestination({ slug }), { replace })
  }
  return { scope, rememberView, entryView, clearView, openView }
}
