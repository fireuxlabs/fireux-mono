export type MarketSection = {
  id: string
  label: string
  description: string
  icon: string
}

export const marketSections: MarketSection[] = [
  {
    id: 'rohmilch',
    label: 'Rohmilch',
    description: 'Frischi Milch direkt us dr Region.',
    icon: 'i-lucide-milk',
  },
  {
    id: 'chaes',
    label: 'Chäs',
    description: 'Lokale Chäs vo Alp, Hof und Chäserei.',
    icon: 'cheese',
  },
  {
    id: 'honig',
    label: 'Honig',
    description: 'Honig vo Imkerinne und Imker vo hie.',
    icon: 'i-lucide-hexagon',
  },
  {
    id: 'huusgmachts',
    label: 'Huusgmachts',
    description: 'Igmachts, Sirup und anders us lokaler Produktion.',
    icon: 'hut',
  },
  {
    id: 'bachigs',
    label: 'Bachigs',
    description: 'Brot, Chueche und süessi Sache.',
    icon: 'i-lucide-croissant',
  },
  {
    id: 'cooks',
    label: 'Cooks & Catering',
    description: 'Für BBQ, Airbnb, Fescht und Catering.',
    icon: 'i-lucide-chef-hat',
  },
]

export function findMarketSection(id: string): MarketSection | undefined {
  return marketSections.find(section => section.id === id)
}
