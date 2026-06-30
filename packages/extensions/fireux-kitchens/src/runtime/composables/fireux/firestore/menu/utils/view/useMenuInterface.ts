import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { Menu } from '../../../../../../models/kitchen/menu/menu.model'

export type MenuInterfaceSource = Omit<Partial<Menu>, 'id' | 'status'> & {
  id?: string
  status?: string
  slug?: string
  path?: string
  qr_path?: string
  kind?: string
  file_kind?: string
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
    title: string
    subtitle: string
    meta: string
    status: string
    badges: string[]
    summary: string
    name: string
    description: string
    active: boolean
    actionLabel: string
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
    | 'title'
    | 'subtitle'
    | 'meta'
    | 'active'
    | 'actionLabel'
    | 'description'
    | 'isActiveNow'
  >

  type MenuPreview = {
    imageUrl: string
    title: string
    subtitle: string
    isActiveNow: boolean
    description: string
    badges: string[]
    details: Array<{ label: string; value: string | number }>
  }

  function map(menu: MenuInterfaceSource): MenuCard.Card {
    const id = safeString(menu.id).trim()
    const slug = safeString(menu.slug).trim() || id
    const name = safeString(menu.name).trim()
    const description = safeString(menu.description).trim()
    const kitchenName = safeString(menu.source?.kitchen_name).trim()
    const createdByLabel = safeString(menu.created_by_label).trim()
    const status = safeString(menu.status).trim()
    const meta = status && status !== 'published' ? status : ''
    const routeId = id || slug
    const to = routeId ? `/menus/${encodeURIComponent(routeId)}` : ''

    return {
      id,
      to,
      imageUrl: '',
      title: name,
      subtitle: kitchenName || createdByLabel || description,
      meta,
      status,
      badges: [],
      summary: description,
      name,
      description,
      active: true,
      actionLabel: '',
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
      title: base.title,
      subtitle: base.subtitle,
      meta: base.meta,
      active: base.active,
      actionLabel: base.actionLabel,
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
