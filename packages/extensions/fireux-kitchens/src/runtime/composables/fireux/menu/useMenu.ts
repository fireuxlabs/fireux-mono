import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useAsyncData } from '#imports'
import type {
  MenuDetailPayload,
  MenuDocumentPayload,
  MenuManifest,
} from '../../../models/kitchen/menu/menu-detail.model'
import type { MenuRouteContext } from '../../../models/kitchen/menu/menu-context.model'
import type { MenuRouteScope } from '../../../utils/kitchen-menu-route'
import { normalizeMenuRouteContext } from '../../../utils/menu-context'

export type MenuRenderKind = 'document' | 'structured' | 'unavailable'

type UseMenuOptions = {
  routeScope: MaybeRefOrGetter<MenuRouteScope>
  menuContext?: MaybeRefOrGetter<MenuRouteContext | string | null | undefined>
}

export function useMenu(
  menuId: MaybeRefOrGetter<string>,
  options: UseMenuOptions
) {
  const id = computed(() => String(toValue(menuId) || '').trim())
  const routeScope = computed(() => toValue(options.routeScope))
  const kitchenSlug = computed(() =>
    routeScope.value.kind === 'directory'
      ? String(routeScope.value.kitchenSlug || '').trim()
      : ''
  )
  const menuContext = computed(() =>
    normalizeMenuRouteContext(toValue(options.menuContext))
  )
  const key = computed(
    () =>
      [
        'menu',
        kitchenSlug.value || 'root',
        id.value || 'none',
        menuContext.value,
      ].join('-')
  )
  const endpoint = computed(() => {
    if (!id.value) return ''

    const query = new URLSearchParams()
    if (kitchenSlug.value) query.set('kitchenSlug', kitchenSlug.value)
    if (menuContext.value !== 'generic') query.set('context', menuContext.value)

    const qs = query.toString()
    return `/api/menus/${encodeURIComponent(id.value)}${qs ? `?${qs}` : ''}`
  })
  const state = useAsyncData(
    key,
    () =>
      endpoint.value
        ? $fetch<MenuDetailPayload>(endpoint.value)
        : null,
    { watch: [endpoint] }
  )
  const renderKind = computed<MenuRenderKind>(() => {
    if (!state.data.value) return 'unavailable'
    return state.data.value.kind === 'document' ? 'document' : 'structured'
  })
  const document = computed<MenuDocumentPayload | null>(() =>
    state.data.value?.kind === 'document' ? state.data.value.document : null
  )
  const manifest = computed<MenuManifest | null>(() =>
    state.data.value?.kind === 'manifest' ? state.data.value.manifest : null
  )

  return {
    id,
    routeScope,
    kitchenSlug,
    menuContext,
    menu: state.data,
    renderKind,
    document,
    manifest,
    pending: state.pending,
    error: state.error,
  }
}
