import type { MenuServiceOffer } from './service-sections'

export type ServiceItemChoices = {
  optionId: string
  extraIds: string[]
  groups: Record<string, string[]>
  quantity: number
}
export type ServiceBasketLine = {
  key: string
  source: MenuServiceOffer['source']
  itemId: string
  offeringIds: string[]
  name: string
  currency: string
  choices: ServiceItemChoices
  details: string[]
  unitMinor: number
  signature: string
}
export const serviceItemSignature = (offer: MenuServiceOffer) =>
  JSON.stringify([offer.source, offer.item, offer.presentation.currencyCode])

/** Local selection only. Catalogue records and order commands are never mutated here. */
export function serviceBasketLine(
  offer: MenuServiceOffer,
  choices: ServiceItemChoices
): ServiceBasketLine {
  const { item } = offer
  if (
    !Number.isInteger(choices.quantity) ||
    choices.quantity < 1 ||
    choices.quantity > 99
  )
    throw new Error('Choose a quantity from 1 to 99.')
  const money = (value: number) => {
    if (!Number.isFinite(value) || value < 0)
      throw new Error('This item has no valid price.')
    const minor = Math.round(value * 100)
    if (!Number.isSafeInteger(minor))
      throw new Error('This item has no valid price.')
    return minor
  }
  const option = item.priceOptions.find((row) => row.id === choices.optionId)
  if (item.priceOptions.length ? !option : Boolean(choices.optionId))
    throw new Error('Choose an available option.')
  const extraIds = [...new Set(choices.extraIds)].sort()
  const extras = extraIds.map((id) => {
    const extra = item.addOns.find((row) => row.id === id)
    if (!extra) throw new Error('An extra is no longer available.')
    return extra
  })
  const groups: Record<string, string[]> = {}
  const details = [
    ...(option ? [option.label] : []),
    ...extras.map((row) => row.label),
  ]
  let unitMinor = money(option?.price ?? item.price)
  for (const extra of extras) unitMinor += money(extra.price)
  for (const group of item.mealDeal?.groups || []) {
    const selected = [...new Set(choices.groups[group.id] || [])].sort()
    if (selected.length !== group.choose)
      throw new Error(`Choose ${group.choose} from ${group.name}.`)
    groups[group.id] = selected
    for (const id of selected) {
      const dish = group.dishes.find((row) => row.dishId === id)
      if (!dish) throw new Error('A meal choice is no longer available.')
      details.push(dish.name)
      unitMinor += money(dish.supplement)
    }
  }
  if (
    Object.keys(choices.groups).some(
      (id) => !item.mealDeal?.groups.some((group) => group.id === id)
    )
  )
    throw new Error('A meal choice has changed.')
  const selection = { ...choices, extraIds, groups }
  const signature = serviceItemSignature(offer)
  return {
    key: JSON.stringify([
      offer.source,
      item.id,
      choices.optionId,
      extraIds,
      groups,
      unitMinor,
    ]),
    source: { ...offer.source },
    itemId: item.id,
    offeringIds: offer.offerings.map((offering) => offering.id).sort(),
    name: item.name,
    currency: offer.presentation.currencyCode,
    choices: selection,
    details,
    unitMinor,
    signature,
  }
}
