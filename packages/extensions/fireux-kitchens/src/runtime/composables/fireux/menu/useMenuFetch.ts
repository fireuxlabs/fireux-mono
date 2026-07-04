import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useAsyncData } from '#imports'
import type { PageStyle } from 'fireux-core/runtime/models/core/style.model'
import type {
  MenuOrderingConfig,
  MenuPublicChoice,
} from '../../../models/kitchen/menu/menu.model'
import type { KitchenMenuSectionRow } from '../kitchen/menu/useKitchenMenu'

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
  public_choices?: MenuPublicChoice[]
  page_style?: Partial<PageStyle>
  sections?: KitchenMenuSectionRow[]
  created_by?: string
  created_by_label?: string
  path: string
  qr_path: string
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
    () => `menu-${kitchenSlug.value || 'root'}-${id.value || 'none'}`
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
