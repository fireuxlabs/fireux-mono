import type { KitchenSellable } from '../../models/sellable.model'
import { normalizeMenuItemPatch } from '../../../menu/utils/menu-item-patch'
import { readKitchenSellable } from '../../utils/sellable'

/** One exact placement becomes one offer; no identity is inferred from its label/price. */
export function legacyPlacementSellable(
  item: Record<string, unknown>,
  currency: string,
  variantId: (index: number) => string,
  variantForms?: unknown
): KitchenSellable {
  const patch = normalizeMenuItemPatch({
    price: item.price as number,
    price_options: (item.price_options || []) as any,
    add_ons: (item.add_ons || []) as any,
  })
  const options = patch.price_options?.length
    ? patch.price_options
    : [{ label: 'Default', quantity: 1, unit: '', price: patch.price! }]
  if (
    variantForms !== undefined &&
    (!Array.isArray(variantForms) || variantForms.length !== options.length)
  )
    throw new Error('Supplied forms must match the existing options exactly.')
  const variants = options.map((option, index) => ({
    id: variantId(index),
    label: option.label,
    quantity: option.quantity,
    unit: option.unit,
    ...(!patch.price_options?.length ? { implicit: true } : {}),
    ...(Array.isArray(variantForms) && variantForms[index] != null
      ? { form: variantForms[index] }
      : {}),
  }))
  return readKitchenSellable({
    dish_id: item.dish_id,
    revision: 1,
    status: 'active',
    variants,
    terms: {
      currency,
      prices: Object.fromEntries(
        variants.map((v, i) => [v.id, options[i]!.price])
      ),
      add_ons: patch.add_ons || [],
    },
  })
}
