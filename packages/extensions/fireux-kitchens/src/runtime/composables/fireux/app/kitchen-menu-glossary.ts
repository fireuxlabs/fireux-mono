export type RestaurantMenuGlossaryNames = Record<string, string>

type RestaurantMenuGlossaryEntry = {
  aliases: string[]
  names: RestaurantMenuGlossaryNames
}

const stripDiacritics = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

export const normalizeRestaurantGlossaryKey = (input: string): string =>
  stripDiacritics(String(input ?? ''))
    .trim()
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/\s*[/|]\s*/g, ' / ')
    .replace(/\s*&\s*/g, ' & ')
    .replace(/\s*-\s*/g, ' - ')
    .replace(/\s+/g, ' ')
    .replace(/^[\s/|:;,.–—-]+|[\s/|:;,.–—-]+$/g, '')

const RESTAURANT_MENU_GLOSSARY: RestaurantMenuGlossaryEntry[] = [
  {
    aliases: ['hauptkarte', 'hauptmenu', 'hauptmenü'],
    names: {
      de: 'Hauptkarte',
      en: 'Main Menu',
      fr: 'Menu principal',
      it: 'Menù principale',
    },
  },
  {
    aliases: ['speisekarte'],
    names: {
      de: 'Speisekarte',
      en: 'Menu',
      fr: 'Carte',
      it: 'Menù',
    },
  },
  {
    aliases: ['beilagen', 'contorni', 'contorni / beilagen'],
    names: {
      de: 'Beilagen',
      en: 'Side Dishes',
      fr: 'Accompagnements',
      it: 'Contorni',
    },
  },
  {
    aliases: ['vorspeisen', 'antipasti', 'antipasti / vorspeisen'],
    names: {
      de: 'Vorspeisen',
      en: 'Starters',
      fr: 'Entrées',
      it: 'Antipasti',
    },
  },
  {
    aliases: ['suppen', 'zuppa', 'zuppa / suppen'],
    names: {
      de: 'Suppen',
      en: 'Soups',
      fr: 'Soupes',
      it: 'Zuppe',
    },
  },
  {
    aliases: ['salate', 'insalate', 'insalate / salate'],
    names: {
      de: 'Salate',
      en: 'Salads',
      fr: 'Salades',
      it: 'Insalate',
    },
  },
  {
    aliases: ['risotto'],
    names: {
      de: 'Risotto',
      en: 'Risotto',
      fr: 'Risotto',
      it: 'Risotto',
    },
  },
  {
    aliases: ['gratiniert', 'gratinato', 'gratinato / gratiniert'],
    names: {
      de: 'Gratiniert',
      en: 'Gratin',
      fr: 'Gratiné',
      it: 'Gratinato',
    },
  },
  {
    aliases: ['kinderkarte', 'kinder karte', 'bambini', 'kinder karte / bambini'],
    names: {
      de: 'Kinderkarte',
      en: 'Kids Menu',
      fr: 'Menu enfant',
      it: 'Menù bambini',
    },
  },
  {
    aliases: ['pasta'],
    names: {
      de: 'Pasta',
      en: 'Pasta',
      fr: 'Pâtes',
      it: 'Pasta',
    },
  },
  {
    aliases: [
      'fisch',
      'pesce',
      'pesce / fisch',
    ],
    names: {
      de: 'Fisch',
      en: 'Fish',
      fr: 'Poisson',
      it: 'Pesce',
    },
  },
  {
    aliases: [
      'fisch & meeresfrüchte',
      'fish & seafood',
    ],
    names: {
      de: 'Fisch & Meeresfrüchte',
      en: 'Fish & Seafood',
      fr: 'Poisson & Fruits de mer',
      it: 'Pesce & Frutti di mare',
    },
  },
  {
    aliases: ['fleisch', 'carne', 'carne / fleisch'],
    names: {
      de: 'Fleisch',
      en: 'Meat',
      fr: 'Viande',
      it: 'Carne',
    },
  },
  {
    aliases: ['heisser stein / spiess', 'hot stone / skewers'],
    names: {
      de: 'Heisser Stein / Spiess',
      en: 'Hot Stone / Skewers',
      fr: 'Pierre chaude / Brochettes',
      it: 'Pietra calda / Spiedini',
    },
  },
  {
    aliases: ['pizza'],
    names: {
      de: 'Pizza',
      en: 'Pizza',
      fr: 'Pizza',
      it: 'Pizza',
    },
  },
  {
    aliases: ['rindsfleisch', 'beef', 'rindsfleisch / beef'],
    names: {
      de: 'Rindsfleisch',
      en: 'Beef',
      fr: 'Bœuf',
      it: 'Manzo',
    },
  },
  {
    aliases: ['poulet', 'chicken', 'poulet / chicken'],
    names: {
      de: 'Poulet',
      en: 'Chicken',
      fr: 'Poulet',
      it: 'Pollo',
    },
  },
  {
    aliases: ['lammfleisch', 'lamb'],
    names: {
      de: 'Lammfleisch',
      en: 'Lamb',
      fr: 'Agneau',
      it: 'Agnello',
    },
  },
  {
    aliases: ['kalbsfleisch', 'veal'],
    names: {
      de: 'Kalbsfleisch',
      en: 'Veal',
      fr: 'Veau',
      it: 'Vitello',
    },
  },
  {
    aliases: ['schweinefleisch', 'pork', 'schweinefleisch / pork'],
    names: {
      de: 'Schweinefleisch',
      en: 'Pork',
      fr: 'Porc',
      it: 'Maiale',
    },
  },
  {
    aliases: ['vegetarisch & vegan'],
    names: {
      de: 'Vegetarisch & Vegan',
      en: 'Vegetarian & Vegan',
      fr: 'Végétarien & Végan',
      it: 'Vegetariano & Vegano',
    },
  },
]

const glossaryByAlias = new Map<string, RestaurantMenuGlossaryNames>()

for (const entry of RESTAURANT_MENU_GLOSSARY) {
  for (const alias of entry.aliases) {
    glossaryByAlias.set(normalizeRestaurantGlossaryKey(alias), entry.names)
  }
}

const withoutPizzaPrefix = (key: string) => key.replace(/^pizza\s*-\s*/, '')

export function getRestaurantMenuGlossaryNames(
  input: string
): RestaurantMenuGlossaryNames | null {
  const key = normalizeRestaurantGlossaryKey(input)
  if (!key) return null

  const direct = glossaryByAlias.get(key)
  if (direct) return { ...direct }

  const withoutPrefix = withoutPizzaPrefix(key)
  const prefixed = glossaryByAlias.get(withoutPrefix)
  if (prefixed) return { ...prefixed }

  const parts = withoutPrefix
    .split('/')
    .map((part) => normalizeRestaurantGlossaryKey(part))
    .filter(Boolean)

  for (const part of parts) {
    const match = glossaryByAlias.get(part)
    if (match) return { ...match }
  }

  return null
}
