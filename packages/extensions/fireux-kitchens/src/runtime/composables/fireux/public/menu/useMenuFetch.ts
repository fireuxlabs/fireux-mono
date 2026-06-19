import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useAsyncData } from '#imports'

export type PublicMenu = {
  id: string
  slug: string
  name: string
  description: string
  doc_url: string
  doc_name: string
  doc_type: string
  kind: string
  doc_storage_path: string
  kitchen_id: string
  kitchen_slug: string
  kitchen_name: string
  kitchen_app_id: string
  kitchen_menu_id: string
  created_by: string
  created_by_label: string
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
