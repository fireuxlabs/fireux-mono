import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { PlaceImageShade } from 'fireux-places/runtime/models/place.model'
import type { Menu } from '../../../../../../models/kitchen/menu/menu.model'
import {
  menuRoutePath,
  rootMenuRouteScope,
} from '../../../../../../utils/kitchen-menu-route'

export type MenuInterfaceSource = Omit<Partial<Menu>, 'id' | 'status'> & {
  id?: string
  status?: string
  path?: string
  qr_path?: string
  kind?: string
  file_kind?: string
  image_url?: string
  imageUrl?: string
  image_shade?: PlaceImageShade
  imageShade?: PlaceImageShade
  source?: {
    app_id?: string
    kitchen_id?: string
    kitchen_slug?: string
    kitchen_name?: string
    menu_id?: string
  }
  created_by_label?: string
}

export namespace MenuCard {
  export type Card = {
    id: string
    to: string
    imageUrl: string
    imageShade?: PlaceImageShade
    title: string
    subtitle: string
    meta: string
    status: string
    badges: string[]
    summary: string
    name: string
    description: string
    active: boolean
    itemCount: number
    isActiveNow: boolean
    windowLabel: string
    sortOrder: number
  }
}

export type MenuProfile = {
  card: MenuCard.Card
  title: string
  subtitle: string
  description: string
  active: boolean
  itemCount: number
}

export function useMenuInterface() {
  type MenuPill = MenuCard.Card

  type MenuCell = Pick<
    MenuCard.Card,
    | 'id'
    | 'to'
    | 'imageUrl'
    | 'imageShade'
    | 'title'
    | 'subtitle'
    | 'meta'
    | 'active'
    | 'description'
    | 'isActiveNow'
  >

  type MenuPreview = {
    imageUrl: string
    imageShade?: PlaceImageShade
    title: string
    subtitle: string
    isActiveNow: boolean
    description: string
    badges: string[]
    details: Array<{ label: string; value: string | number }>
  }

  function map(menu: MenuInterfaceSource): MenuCard.Card {
    const id = safeString(menu.id).trim()
    const name = safeString(menu.name).trim()
    const description = safeString(menu.description).trim()
    const imageUrl = safeString(menu.image_url || menu.imageUrl).trim()
    const imageShade = menu.image_shade || menu.imageShade
    const kitchenName = safeString(menu.source?.kitchen_name).trim()
    const createdByLabel = safeString(menu.created_by_label).trim()
    const status = safeString(menu.status).trim()
    const meta = status && status !== 'published' ? status : ''
    const to = menuRoutePath({
      scope: rootMenuRouteScope(),
      menuId: id,
    })

    return {
      id,
      to,
      imageUrl,
      imageShade,
      title: name,
      subtitle: kitchenName || createdByLabel || description,
      meta,
      status,
      badges: [],
      summary: description,
      name,
      description,
      active: true,
      itemCount: 0,
      isActiveNow: true,
      windowLabel: '',
      sortOrder: Number(menu.sort_order ?? 0),
    }
  }

  function buildInterface(
    target?: MenuInterfaceSource | null | undefined
  ): MenuCard.Card | null {
    if (!target) return null
    const mapped = map(target)
    return mapped.id ? mapped : null
  }

  const toInterface = buildInterface

  function pill(
    target?: MenuInterfaceSource | null | undefined
  ): MenuPill | null {
    const base = buildInterface(target)
    if (!base) return null
    return {
      ...base,
      title: base.title,
      subtitle: base.subtitle,
    }
  }

  function cell(
    target?: MenuInterfaceSource | null | undefined
  ): MenuCell | null {
    const base = buildInterface(target)
    if (!base) return null
    return {
      id: base.id,
      to: base.to,
      imageUrl: base.imageUrl,
      imageShade: base.imageShade,
      title: base.title,
      subtitle: base.subtitle,
      meta: base.meta,
      active: base.active,
      description: '',
      isActiveNow: base.isActiveNow,
    }
  }

  function preview(
    target?: MenuInterfaceSource | null | undefined
  ): MenuPreview | null {
    const base = buildInterface(target)
    if (!base) return null

    return {
      imageUrl: base.imageUrl,
      imageShade: base.imageShade,
      title: base.title,
      subtitle: base.subtitle,
      isActiveNow: base.isActiveNow,
      description: base.description,
      badges: base.badges,
      details: [
        { label: 'Status', value: base.status },
        { label: 'Sort order', value: base.sortOrder },
      ],
    }
  }

  function profile(
    target?: MenuInterfaceSource | null | undefined
  ): MenuProfile | null {
    const base = buildInterface(target)
    if (!base) return null

    return {
      card: base,
      title: base.title,
      subtitle: base.subtitle,
      description: base.description,
      active: base.active,
      itemCount: base.itemCount,
    }
  }

  return {
    interface: toInterface,
    pill,
    cell,
    preview,
    profile,
  }
}
