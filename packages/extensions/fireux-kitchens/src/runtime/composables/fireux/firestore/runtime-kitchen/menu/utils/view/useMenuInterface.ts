import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { Menu } from '../../../../../../../models/menu.model'

const stripKitchenPrefix = (value: string): string =>
  value.replace(/^la\s+tapberne\s*[—-]\s*/i, '').trim()

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

  function map(menu: Menu): MenuCard.Card {
    const active = Boolean(menu.active)
    const items = (menu.sections ?? []).flatMap((section) => section.items ?? [])
    const id =
      safeString(menu.id).trim() ||
      safeString(menu.name).trim() ||
      `menu-${items.length}`
    const rawName = safeString(menu.name).trim()
    const name = stripKitchenPrefix(rawName) || rawName || id
    const isActiveNow = active
    const windowLabel = ''

    return {
      id,
      to: `/console/kitchen/menus/${encodeURIComponent(id)}`,
      imageUrl: '',
      title: name,
      subtitle: '',
      meta: [`Items: ${items.length}`, windowLabel]
        .filter(Boolean)
        .join(' · '),
      status: active ? 'active' : 'inactive',
      badges: [
        `${items.length} ${items.length === 1 ? 'item' : 'items'}`,
      ],
      summary: safeString(menu.description).trim(),
      name,
      description: safeString(menu.description).trim(),
      active,
      itemCount: items.length,
      isActiveNow,
      windowLabel,
      sortOrder: Number(menu.sort_order || 0),
    }
  }

  function buildInterface(
    target?: Menu | null | undefined
  ): MenuCard.Card | null {
    if (!target) return null
    const mapped = map(target)
    return mapped.id ? mapped : null
  }

  const toInterface = buildInterface

  function pill(target?: Menu | null | undefined): MenuPill | null {
    const base = buildInterface(target)
    if (!base) return null
    return {
      ...base,
      title: base.title,
      subtitle: base.subtitle,
    }
  }

  function cell(target?: Menu | null | undefined): MenuCell | null {
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
      description: base.description,
      isActiveNow: base.isActiveNow,
    }
  }

  function preview(target?: Menu | null | undefined): MenuPreview | null {
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
        { label: 'Active', value: base.active ? 'Yes' : 'No' },
        { label: 'Items', value: base.itemCount },
        ...(base.windowLabel
          ? [{ label: 'Window', value: base.windowLabel }]
          : []),
      ],
    }
  }

  function profile(target?: Menu | null | undefined): MenuProfile | null {
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
