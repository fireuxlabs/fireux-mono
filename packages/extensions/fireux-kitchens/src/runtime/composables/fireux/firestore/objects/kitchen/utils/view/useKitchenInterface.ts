import type { Kitchen } from '../../../../../../../models/objects/kitchen.model.ts'

export namespace KitchenCard {
  export interface Pill {
    id?: string
    title: string
    subtitle?: string | null
  }

  export interface Cell extends Pill {
    formatted_address?: string | null
  }

  export type Profile = Kitchen
}

export function useKitchenInterface() {
  const pillProps = (kitchen?: Kitchen | null): KitchenCard.Pill => ({
    id: kitchen?.id ?? kitchen?.place_id,
    title: kitchen?.name || 'Kitchen',
    subtitle: kitchen?.formatted_address ?? null,
  })

  const cellProps = (kitchen?: Kitchen | null): KitchenCard.Cell => {
    const pill = pillProps(kitchen)
    return {
      ...pill,
      formatted_address: kitchen?.formatted_address ?? null,
    }
  }

  return { pillProps, cellProps }
}
