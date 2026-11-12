export type ItemChoiceOption = { id: string; label: string; price: number }
export type ItemChoiceGroup = {
  id: string
  name: string
  min: number
  max: number | null
  pricing: 'full' | 'additional'
  options: ItemChoiceOption[]
}
export type ItemChoiceSelection = Record<string, string[]>
