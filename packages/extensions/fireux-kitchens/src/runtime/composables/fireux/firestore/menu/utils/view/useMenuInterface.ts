import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { Menu } from '../../../../../../models/menu.model'

const stripKitchenPrefix = (value: string): string =>
  value.replace(/^la\s+tapberne\s*[—-]\s*/i, '').trim()

export namespace MenuCard {
  export type Card = {
    id: string
    to: string
    imageUrl: string
    title: string
    subtitle: string
    badges: string[]
    name: string
    description: string
    active: boolean
    dishCount: number
    isActiveNow: boolean
    windowLabel: string
    sortOrder: number
  }
}

export type MenuProfile = {
  card: MenuCard.Card
  title: string
  subtitle: string
  prop?: string
  active: boolean
  dishCount: number
}

export function useMenuInterface() {
  type MenuPill = MenuCard.Card

  type MenuCell = Pick<
    MenuCard.Card,
    | 'id'
    | 'to'
    | 'imageUrl'
    | 'name'
    | 'subtitle'
    | 'active'
    | 'dishCount'
    | 'isActiveNow'
    | 'windowLabel'
  > & {
    prop?: string
  }

  type MenuPreview = {
    imageUrl: string
    name: string
    subtitle: string
    isActiveNow: boolean
    prop?: string
    badges: string[]
    details: Array<{ label: string; value: string | number }>
  }

  function map(menu: Menu): MenuCard.Card {
    const active = Boolean(menu.active)
    const dishes = (menu.sections ?? [])
      .flatMap((section) => section.items ?? [])
      .map((item) => safeString(item?.dish_id).trim())
      .filter(Boolean)
    const id =
      safeString(menu.id).trim() ||
      safeString(menu.name).trim() ||
      `menu-${dishes.length}`
    const rawName = safeString(menu.name).trim()
    const name = stripKitchenPrefix(rawName) || rawName || id
    const isActiveNow = active
    const windowLabel = ''

    return {
      id,
      to: '/dashboard/kitchen/menu',
      imageUrl: '',
      title: name,
      subtitle: '',
      badges: [
        active ? 'active' : 'inactive',
        `${dishes.length} ${dishes.length === 1 ? 'dish' : 'dishes'}`,
      ],
      name,
      description: safeString(menu.description).trim(),
      active,
      dishCount: dishes.length,
      isActiveNow,
      windowLabel,
      sortOrder: Number(menu.sort_order || 0),
    }
  }

  function card(target?: Menu | null | undefined): MenuCard.Card | null {
    if (!target) return null
    const mapped = map(target)
    return mapped.id ? mapped : null
  }

  function pill(target?: Menu | null | undefined): MenuPill | null {
    const base = card(target)
    if (!base) return null
    return {
      ...base,
      title: base.title,
      subtitle: base.subtitle,
    }
  }

  function cell(target?: Menu | null | undefined): MenuCell | null {
    const base = card(target)
    if (!base) return null
    return {
      id: base.id,
      to: base.to,
      imageUrl: base.imageUrl,
      name: base.name,
      subtitle: base.subtitle,
      active: base.active,
      dishCount: base.dishCount,
      isActiveNow: base.isActiveNow,
      windowLabel: base.windowLabel,
      prop: base.description,
    }
  }

  function preview(target?: Menu | null | undefined): MenuPreview | null {
    const base = card(target)
    if (!base) return null

    return {
      imageUrl: base.imageUrl,
      name: base.name,
      subtitle: base.subtitle,
      isActiveNow: base.isActiveNow,
      prop: base.description,
      badges: base.badges,
      details: [
        { label: 'Active', value: base.active ? 'Yes' : 'No' },
        { label: 'Dishes', value: base.dishCount },
        ...(base.windowLabel ? [{ label: 'Window', value: base.windowLabel }] : []),
      ],
    }
  }

  function profile(target?: Menu | null | undefined): MenuProfile | null {
    const base = card(target)
    if (!base) return null

    return {
      card: base,
      title: base.title,
      subtitle: base.subtitle,
      prop: base.description,
      active: base.active,
      dishCount: base.dishCount,
    }
  }

  function searchText(menu: Menu): string {
    const mapped = map(menu)
    return [
      mapped.name,
      mapped.active ? 'active' : 'inactive',
      mapped.dishCount,
      mapped.windowLabel,
      mapped.id,
    ]
      .join(' ')
      .trim()
      .toLowerCase()
  }

  return { card, pill, cell, preview, profile, searchText }
}
