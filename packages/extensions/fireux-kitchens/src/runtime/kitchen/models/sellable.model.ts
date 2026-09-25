import type { MenuItemAddOnOption } from '../../menu/models/menu-item.model'

/** Received form. Volume is independent of the number of items ordered. */
export type SellableForm = {
  volume?: { value: number; unit: 'ml' | 'l' }
  container?: string
  source?: string
}

/** Supplied form, independent of a Menu placement or entry surface. */
export type SellableVariant = {
  id: string
  label: string
  quantity: number
  unit: string
  implicit?: boolean
  form?: SellableForm
}
export type SellableFulfilment =
  | 'on_premise'
  | 'collection'
  | 'delivery'
  | 'room'
/** First cutover supports base terms only; contextual overrides are not inferred. */
export type KitchenSellable = {
  dish_id: string
  revision: number
  status: 'active' | 'archived'
  variants: SellableVariant[]
  terms: {
    currency: string
    prices: Record<string, number>
    add_ons: MenuItemAddOnOption[]
    /** Absent means no intrinsic restriction; Service still authorizes ordering. */
    fulfilment?: Partial<Record<string, SellableFulfilment[]>>
  }
}
