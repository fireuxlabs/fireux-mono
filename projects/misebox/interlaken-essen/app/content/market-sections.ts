import type { InterlakenPublicCopyKey } from './sproochli-copy-public'

export type MarketSection = {
  id: string
  labelKey: InterlakenPublicCopyKey
  descriptionKey: InterlakenPublicCopyKey
  icon: string
}

export const marketSections: MarketSection[] = [
  {
    id: 'rohmilch',
    labelKey: 'section_raw_milk_label',
    descriptionKey: 'section_raw_milk_description',
    icon: 'i-lucide-milk',
  },
  {
    id: 'chaes',
    labelKey: 'section_cheese_label',
    descriptionKey: 'section_cheese_description',
    icon: 'cheese',
  },
  {
    id: 'honig',
    labelKey: 'section_honey_label',
    descriptionKey: 'section_honey_description',
    icon: 'i-lucide-hexagon',
  },
  {
    id: 'huusgmachts',
    labelKey: 'section_homemade_label',
    descriptionKey: 'section_homemade_description',
    icon: 'hut',
  },
  {
    id: 'bachigs',
    labelKey: 'section_baking_label',
    descriptionKey: 'section_baking_description',
    icon: 'i-lucide-croissant',
  },
  {
    id: 'cooks',
    labelKey: 'section_cooks_label',
    descriptionKey: 'section_cooks_description',
    icon: 'i-lucide-chef-hat',
  },
]

export function findMarketSection(id: string): MarketSection | undefined {
  return marketSections.find(section => section.id === id)
}
