import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { KitchenMiseTask } from '../../../../../utils/mise.ts'

const MISSING_TITLE = 'Missing mise title'

export namespace MiseEnPlaceCard {
  export type Card = {
    id: string
    to: string
    imageUrl: string
    title: string
    subtitle: string
    icon: string
    meta: string
    badges: string[]
    summary: string
    name: string
    description: string
    category: string
    unit: string
    status: string
    tags: string[]
    hasMissingTitle: boolean
  }
}

export type MiseEnPlaceProfile = {
  card: MiseEnPlaceCard.Card
  title: string
  subtitle: string
  prop?: string
  category: string
  unit: string
  status: string
  tags: string[]
}

export function useMiseEnPlaceInterface() {
  type MiseEnPlacePill = MiseEnPlaceCard.Card

  type MiseEnPlaceCell = Pick<
    MiseEnPlaceCard.Card,
    | 'id'
    | 'to'
    | 'imageUrl'
    | 'name'
    | 'subtitle'
    | 'icon'
    | 'status'
    | 'category'
    | 'unit'
  > & {
    prop?: string
  }

  type MiseEnPlacePreview = {
    imageUrl: string
    name: string
    subtitle: string
    status: string
    prop?: string
    badges: string[]
    details: Array<{ label: string; value: string | number }>
  }

  function map(task: KitchenMiseTask): MiseEnPlaceCard.Card {
    const id = safeString(task.id).trim()
    const title = safeString(task.title).trim()
    const name = title || MISSING_TITLE
    const category = resolveResponsibility(task)
    const unit = ''
    const status = safeString(task.status).trim()

    return {
      id,
      to: id ? `/workspace/kitchen/mise/${encodeURIComponent(id)}` : '',
      imageUrl: '',
      icon: resolveIcon(task),
      title: name,
      subtitle: category,
      meta: category,
      badges: [],
      summary: safeString(task.description).trim(),
      name,
      description: safeString(task.description).trim(),
      category,
      unit,
      status,
      tags: [],
      hasMissingTitle: !title,
    }
  }

  function buildInterface(
    target?: KitchenMiseTask | null | undefined
  ): MiseEnPlaceCard.Card | null {
    if (!target) return null
    const mapped = map(target)
    return mapped.id ? mapped : null
  }

  const toInterface = buildInterface

  function pill(
    target?: KitchenMiseTask | null | undefined
  ): MiseEnPlacePill | null {
    const base = buildInterface(target)
    if (!base) return null
    return {
      ...base,
      title: base.title,
      subtitle: base.subtitle,
    }
  }

  function cell(
    target?: KitchenMiseTask | null | undefined
  ): MiseEnPlaceCell | null {
    const base = buildInterface(target)
    if (!base) return null
    return {
      id: base.id,
      to: base.to,
      imageUrl: base.imageUrl,
      name: base.name,
      subtitle: base.subtitle,
      icon: base.icon,
      status: base.status,
      category: base.category,
      unit: base.unit,
      prop: base.description,
    }
  }

  function preview(
    target?: KitchenMiseTask | null | undefined
  ): MiseEnPlacePreview | null {
    const base = buildInterface(target)
    if (!base) return null

    return {
      imageUrl: base.imageUrl,
      name: base.name,
      subtitle: base.subtitle,
      status: base.status,
      prop: base.description,
      badges: base.badges,
      details: [
        { label: 'Station', value: base.category || '—' },
        { label: 'ETA', value: base.unit || '—' },
      ],
    }
  }

  function profile(
    target?: KitchenMiseTask | null | undefined
  ): MiseEnPlaceProfile | null {
    const base = buildInterface(target)
    if (!base) return null

    return {
      card: base,
      title: base.title,
      subtitle: base.subtitle,
      prop: base.description,
      category: base.category,
      unit: base.unit,
      status: base.status,
      tags: base.tags,
    }
  }

  return { interface: toInterface, pill, cell, preview, profile }
}

function resolveResponsibility(task: KitchenMiseTask) {
  return safeString(task.station).trim()
}

function resolveIcon(_task: KitchenMiseTask) {
  return 'i-lucide-list-checks'
}
