/** Item-owned selling defaults. These values are separate from Item identity. */
export type ItemChoiceGroup = {
  id: string
  name: string
  min: number
  max: number | null
  pricing: 'full' | 'additional'
  options: Array<{ id: string; label: string; price: number }>
}

/** A selection is request state, never part of the reusable Item record. */
export type ItemChoiceSelection = Record<string, string[]>

export type ItemOffer = {
  price?: number
  choice_groups: ItemChoiceGroup[]
}
