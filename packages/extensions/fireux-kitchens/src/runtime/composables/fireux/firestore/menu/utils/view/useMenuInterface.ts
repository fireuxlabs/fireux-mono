import { safeString, safeStringArray } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { Menu } from '../../../../../../models/menu.model'

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

  const menuDayByDateDay: Array<'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'> = [
    'sun',
    'mon',
    'tue',
    'wed',
    'thu',
    'fri',
    'sat',
  ]

  const toMinutes = (value: string): number => {
    const clean = safeString(value).trim()
    const match = clean.match(/^(\d{1,2}):(\d{2})$/)
    if (!match) return -1
    const hours = Number(match[1])
    const minutes = Number(match[2])
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return -1
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return -1
    return hours * 60 + minutes
  }

  const resolveMenuIsActiveNow = (menu: Menu): boolean => {
    const status = safeString((menu as any)?.status).trim().toLowerCase()
    if (status !== 'live') return false

    const rawRules = (menu as any)?.service_rules
    const days = Array.isArray(rawRules?.days)
      ? rawRules.days.map((day: unknown) => safeString(day).trim().toLowerCase()).filter(Boolean)
      : []
    const startMinutes = toMinutes(safeString(rawRules?.start_time))
    const endMinutes = toMinutes(safeString(rawRules?.end_time))

    // If rules are not fully defined, activity is unknown -> treat as inactive.
    if (!days.length || startMinutes < 0 || endMinutes < 0) return false

    const now = new Date()
    const nowDay = menuDayByDateDay[now.getDay()]
    const previousDay = menuDayByDateDay[(now.getDay() + 6) % 7]
    const nowMinutes = now.getHours() * 60 + now.getMinutes()

    if (startMinutes === endMinutes) {
      // 24h service for the listed days.
      return days.includes(nowDay)
    }

    if (endMinutes > startMinutes) {
      return days.includes(nowDay) && nowMinutes >= startMinutes && nowMinutes < endMinutes
    }

    // Overnight window (e.g. 22:00 -> 02:00).
    return (
      (days.includes(nowDay) && nowMinutes >= startMinutes) ||
      (days.includes(previousDay) && nowMinutes < endMinutes)
    )
  }

  function map(menu: Menu): MenuCard.Card {
    const service = safeString(menu.service).trim()
    const status = safeString(menu.status).trim()
    const dishes = safeStringArray(menu.dish_ids)
    const id =
      safeString(menu.id).trim() ||
      safeString(menu.name).trim() ||
      `${service || 'menu'}-${status || 'status'}-${dishes.length}`
    const name = safeString(menu.name).trim() || id
    const stations = safeStringArray(menu.stations)
    const rules = (menu as any)?.service_rules
    const rulesStart = safeString(rules?.start_time).trim()
    const rulesEnd = safeString(rules?.end_time).trim()
    const isActiveNow = resolveMenuIsActiveNow(menu)
    const windowLabel = rulesStart && rulesEnd ? `${rulesStart} - ${rulesEnd}` : ''

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
      status: base.status,
      service: base.service,
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

  function profile(target?: Menu | null | undefined): MenuProfile | null {
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

  function searchText(menu: Menu): string {
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
