import { safeString, safeStringArray } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { KitchenMenu } from '../../../../../../models/menu.model'

const joinSubtitle = (service: string, status: string): string =>
  [safeString(service).trim(), safeString(status).trim()].filter(Boolean).join(' · ')

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
    status: string
    service: string
    dishCount: number
    stations: string[]
    active: boolean
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
  status: string
  service: string
  dishCount: number
  stations: string[]
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
    | 'status'
    | 'service'
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
    status: string
    isActiveNow: boolean
    prop?: string
    badges: string[]
    details: Array<{ label: string; value: string | number }>
  }

  const toDate = (value: unknown): Date | null => {
    if (!value) return null

    if (typeof value === 'string') {
      const parsed = new Date(value)
      return Number.isNaN(parsed.getTime()) ? null : parsed
    }

    if (typeof value === 'object') {
      const seconds = Number((value as any)?.seconds)
      if (Number.isFinite(seconds) && seconds > 0) return new Date(seconds * 1000)

      const maybeToDate = (value as any)?.toDate
      if (typeof maybeToDate === 'function') {
        const parsed = maybeToDate.call(value)
        if (parsed instanceof Date && !Number.isNaN(parsed.getTime())) return parsed
      }
    }

    return null
  }

  const formatTime = (date: Date | null): string => {
    if (!date) return ''
    const hh = String(date.getHours()).padStart(2, '0')
    const mm = String(date.getMinutes()).padStart(2, '0')
    return `${hh}:${mm}`
  }

  function map(menu: KitchenMenu): MenuCard.Card {
    const id = safeString(menu.id).trim()
    const name = safeString(menu.name).trim() || id
    const service = safeString(menu.service).trim()
    const status = safeString(menu.status).trim()
    const dishes = safeStringArray(menu.dish_ids)
    const stations = safeStringArray(menu.stations)
    const startsAt = toDate((menu as any)?.starts_at)
    const endsAt = toDate((menu as any)?.ends_at)
    const now = new Date()
    const inWindow =
      (!startsAt || now.getTime() >= startsAt.getTime()) &&
      (!endsAt || now.getTime() <= endsAt.getTime())
    const isActiveNow = Boolean(menu.active) && inWindow
    const windowLabel = [formatTime(startsAt), formatTime(endsAt)].filter(Boolean).join(' - ')

    return {
      id,
      to: '',
      imageUrl: '',
      title: name,
      subtitle: joinSubtitle(service, status),
      badges: [
        service || 'service',
        `${dishes.length} ${dishes.length === 1 ? 'dish' : 'dishes'}`,
      ],
      name,
      description: safeString(menu.description).trim(),
      status,
      service,
      dishCount: dishes.length,
      stations,
      active: Boolean(menu.active),
      isActiveNow,
      windowLabel,
      sortOrder: Number(menu.sort_order || 0),
    }
  }

  function card(target?: KitchenMenu | null | undefined): MenuCard.Card | null {
    if (!target) return null
    const mapped = map(target)
    return mapped.id ? mapped : null
  }

  function pill(target?: KitchenMenu | null | undefined): MenuPill | null {
    const base = card(target)
    if (!base) return null
    return {
      ...base,
      title: base.title,
      subtitle: base.subtitle,
    }
  }

  function cell(target?: KitchenMenu | null | undefined): MenuCell | null {
    const base = card(target)
    if (!base) return null
    return {
      id: base.id,
      to: base.to,
      imageUrl: base.imageUrl,
      name: base.name,
      subtitle: base.subtitle,
      status: base.status,
      service: base.service,
      dishCount: base.dishCount,
      isActiveNow: base.isActiveNow,
      windowLabel: base.windowLabel,
      prop: base.description,
    }
  }

  function preview(target?: KitchenMenu | null | undefined): MenuPreview | null {
    const base = card(target)
    if (!base) return null

    return {
      imageUrl: base.imageUrl,
      name: base.name,
      subtitle: base.subtitle,
      status: base.status,
      isActiveNow: base.isActiveNow,
      prop: base.description,
      badges: base.badges,
      details: [
        { label: 'Service', value: base.service || '—' },
        { label: 'Dishes', value: base.dishCount },
        { label: 'Stations', value: base.stations.join(', ') || '—' },
        ...(base.windowLabel ? [{ label: 'Window', value: base.windowLabel }] : []),
      ],
    }
  }

  function profile(target?: KitchenMenu | null | undefined): MenuProfile | null {
    const base = card(target)
    if (!base) return null

    return {
      card: base,
      title: base.title,
      subtitle: base.subtitle,
      prop: base.description,
      status: base.status,
      service: base.service,
      dishCount: base.dishCount,
      stations: base.stations,
    }
  }

  function searchText(menu: KitchenMenu): string {
    const mapped = map(menu)
    return [
      mapped.name,
      mapped.status,
      mapped.service,
      mapped.stations.join(' '),
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
