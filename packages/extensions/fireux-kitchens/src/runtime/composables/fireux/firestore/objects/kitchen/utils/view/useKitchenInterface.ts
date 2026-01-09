import type { Kitchen } from '../../../../../../../models/objects/kitchen.model.ts'

export namespace KitchenCard {
  export interface Pill {
    id?: string
    title: string
    subtitle?: string | null
  }

  export interface Cell extends Pill {
    formatted_address?: string | null
    avatar?: string | null
    website?: string | null
  }

  export type Card = Cell

  export type Profile = Kitchen
}

export function useKitchenInterface() {
  function card(kitchen: Kitchen): KitchenCard.Card
  function card(kitchen?: Kitchen | null | undefined): KitchenCard.Card | null
  function card(kitchen?: Kitchen | null | undefined): KitchenCard.Card | null {
    return kitchen ? cellProps(kitchen) : null
  }

  const pillProps = (kitchen?: Kitchen | null): KitchenCard.Pill => ({
    id: kitchen?.id,
    title: kitchen?.name || 'Kitchen',
    subtitle: kitchen?.formatted_address ?? null,
  })

  const cellProps = (kitchen?: Kitchen | null): KitchenCard.Cell => {
    const pill = pillProps(kitchen)
    return {
      ...pill,
      formatted_address: kitchen?.formatted_address ?? null,
      avatar: kitchen?.avatar ?? null,
      website: (kitchen as any)?.website ?? null,
    }
  }

  return { card, pillProps, cellProps }
}
