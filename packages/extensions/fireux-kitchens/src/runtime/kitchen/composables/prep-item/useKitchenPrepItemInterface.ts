import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { KitchenPrepItem } from '../../utils/prep-item.ts'

export namespace KitchenPrepItemCard {
  export type Card = {
    id: string
    to: string
    avatarUrl: string
    imageUrl: string
    subtitle: string
    meta: string
    title: string
    status: string
    badges: string[]
    summary: string
    prop?: string
  }
}

export function useKitchenPrepItemInterface() {
  function map(prepItem: KitchenPrepItem): KitchenPrepItemCard.Card {
    const id = safeString(prepItem.id).trim()
    const title = safeString(prepItem.name).trim()
    const summary = safeString(prepItem.description).trim()
    const station = safeString(prepItem.station).trim()

    return {
      id,
      to: '',
      avatarUrl: '',
      imageUrl: '',
      subtitle: summary,
      meta: station,
      title,
      status: '',
      badges: station ? [station] : [],
      summary,
      prop: summary,
    }
  }

  function buildInterface(
    target?: KitchenPrepItem | null
  ): KitchenPrepItemCard.Card | null {
    return target ? map(target) : null
  }

  return {
    interface: buildInterface,
    pill: buildInterface,
    cell: buildInterface,
    preview: buildInterface,
    profile: buildInterface,
  }
}
