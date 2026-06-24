import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useAsyncData } from '#imports'
import type { PageStyle } from 'fireux-core/runtime/models/core/style.model'
import type {
  MenuOrderingConfig,
  MenuView,
} from '../../../../models/menu/menu.model'
import type { KitchenPublicMenuSectionRow } from '../kitchen/menu/useKitchenPublicMenu'

export type PublicMenu = {
  id: string
  slug: string
  name: string
  description?: string
  status?: string
  kind: 'doc' | 'menu'
  file_kind?: 'photo' | 'pdf' | 'document'
  file?: {
    url?: string
    name?: string
    type?: string
    storage_path?: string
  }
  source?: {
    app_id?: string
    kitchen_id?: string
    kitchen_slug?: string
    kitchen_name?: string
    menu_id?: string
  }
  ordering?: MenuOrderingConfig
  public_views?: MenuView[]
  page_style?: Partial<PageStyle>
  sections?: KitchenPublicMenuSectionRow[]
  created_by?: string
  created_by_label?: string
  path: string
  qr_path: string
  view_label: string
  view_to: string
}

type UseMenuFetchOptions = {
  kitchenSlug?: MaybeRefOrGetter<string | null | undefined>
}

export function useMenuFetch(
  menuId: MaybeRefOrGetter<string>,
  options: UseMenuFetchOptions = {}
) {
  const id = computed(() => String(toValue(menuId) || '').trim())
  const kitchenSlug = computed(() =>
    String(toValue(options.kitchenSlug) || '').trim()
  )
  const key = computed(
    () => `public-menu-${kitchenSlug.value || 'root'}-${id.value || 'none'}`
  )
  const endpoint = computed(() => {
    if (!id.value) return ''

    const query = new URLSearchParams()
    if (kitchenSlug.value) query.set('kitchenSlug', kitchenSlug.value)

    const qs = query.toString()
    return `/api/menus/${encodeURIComponent(id.value)}${qs ? `?${qs}` : ''}`
  })
  const state = useAsyncData(
    key,
    () =>
      endpoint.value
        ? $fetch<PublicMenu>(endpoint.value)
        : null,
    { watch: [endpoint] }
  )

  return {
    id,
    kitchenSlug,
    menu: state.data,
    pending: state.pending,
    error: state.error,
  }
}
