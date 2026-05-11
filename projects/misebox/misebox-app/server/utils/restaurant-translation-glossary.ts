export type RestaurantGlossaryNames = Record<string, string>

type RestaurantGlossaryEntry = {
  aliases: string[]
  names: RestaurantGlossaryNames
}

const stripDiacritics = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

export const normalizeRestaurantGlossaryKey = (input: unknown): string =>
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

const RESTAURANT_MENU_GLOSSARY: RestaurantGlossaryEntry[] = [
  {
    aliases: ['hauptkarte', 'hauptmenu', 'hauptmenü', 'main menu'],
    names: {
      de: 'Hauptkarte',
      en: 'Main Menu',
      fr: 'Menu principal',
      it: 'Menù principale',
      es: 'Menú principal',
      pt: 'Menu principal',
      ja: 'メインメニュー',
      'zh-CN': '主菜单',
      ko: '메인 메뉴',
      ar: 'القائمة الرئيسية',
    },
  },
  {
    aliases: ['speisekarte', 'menu'],
    names: {
      de: 'Speisekarte',
      en: 'Menu',
      fr: 'Carte',
      it: 'Menù',
      es: 'Menú',
      pt: 'Menu',
      ja: 'メニュー',
      'zh-CN': '菜单',
      ko: '메뉴',
      ar: 'القائمة',
    },
  },
  {
    aliases: ['beilagen', 'contorni', 'contorni / beilagen', 'side dishes'],
    names: {
      de: 'Beilagen',
      en: 'Side Dishes',
      fr: 'Accompagnements',
      it: 'Contorni',
      es: 'Guarniciones',
      pt: 'Acompanhamentos',
      ja: 'サイドメニュー',
      'zh-CN': '配菜',
      ko: '사이드 메뉴',
      ar: 'الأطباق الجانبية',
    },
  },
  {
    aliases: ['vorspeisen', 'antipasti', 'antipasti / vorspeisen', 'starters'],
    names: {
      de: 'Vorspeisen',
      en: 'Starters',
      fr: 'Entrées',
      it: 'Antipasti',
      es: 'Entrantes',
      pt: 'Entradas',
      ja: '前菜',
      'zh-CN': '前菜',
      ko: '전채',
      ar: 'المقبلات',
    },
  },
  {
    aliases: ['suppen', 'zuppa', 'zuppa / suppen', 'soups'],
    names: {
      de: 'Suppen',
      en: 'Soups',
      fr: 'Soupes',
      it: 'Zuppe',
      es: 'Sopas',
      pt: 'Sopas',
      ja: 'スープ',
      'zh-CN': '汤',
      ko: '수프',
      ar: 'الشوربات',
    },
  },
  {
    aliases: ['salate', 'insalate', 'insalate / salate', 'salads'],
    names: {
      de: 'Salate',
      en: 'Salads',
      fr: 'Salades',
      it: 'Insalate',
      es: 'Ensaladas',
      pt: 'Saladas',
      ja: 'サラダ',
      'zh-CN': '沙拉',
      ko: '샐러드',
      ar: 'السلطات',
    },
  },
  {
    aliases: ['pasta'],
    names: {
      de: 'Pasta',
      en: 'Pasta',
      fr: 'Pâtes',
      it: 'Pasta',
      es: 'Pasta',
      pt: 'Massa',
      ja: 'パスタ',
      'zh-CN': '意面',
      ko: '파스타',
      ar: 'المعكرونة',
    },
  },
  {
    aliases: ['fisch', 'pesce', 'pesce / fisch', 'fish'],
    names: {
      de: 'Fisch',
      en: 'Fish',
      fr: 'Poisson',
      it: 'Pesce',
      es: 'Pescado',
      pt: 'Peixe',
      ja: '魚料理',
      'zh-CN': '鱼类',
      ko: '생선',
      ar: 'الأسماك',
    },
  },
  {
    aliases: ['fleisch', 'carne', 'carne / fleisch', 'meat'],
    names: {
      de: 'Fleisch',
      en: 'Meat',
      fr: 'Viande',
      it: 'Carne',
      es: 'Carne',
      pt: 'Carne',
      ja: '肉料理',
      'zh-CN': '肉类',
      ko: '고기',
      ar: 'اللحوم',
    },
  },
  {
    aliases: ['pizza'],
    names: {
      de: 'Pizza',
      en: 'Pizza',
      fr: 'Pizza',
      it: 'Pizza',
      es: 'Pizza',
      pt: 'Pizza',
      ja: 'ピザ',
      'zh-CN': '披萨',
      ko: '피자',
      ar: 'بيتزا',
    },
  },
  {
    aliases: ['rindsfleisch', 'beef', 'rindsfleisch / beef'],
    names: {
      de: 'Rindsfleisch',
      en: 'Beef',
      fr: 'Bœuf',
      it: 'Manzo',
      es: 'Ternera',
      pt: 'Carne de vaca',
      ja: '牛肉',
      'zh-CN': '牛肉',
      ko: '소고기',
      ar: 'لحم البقر',
    },
  },
  {
    aliases: ['poulet', 'chicken', 'poulet / chicken'],
    names: {
      de: 'Poulet',
      en: 'Chicken',
      fr: 'Poulet',
      it: 'Pollo',
      es: 'Pollo',
      pt: 'Frango',
      ja: '鶏肉',
      'zh-CN': '鸡肉',
      ko: '닭고기',
      ar: 'الدجاج',
    },
  },
  {
    aliases: ['schweinefleisch', 'pork', 'schweinefleisch / pork'],
    names: {
      de: 'Schweinefleisch',
      en: 'Pork',
      fr: 'Porc',
      it: 'Maiale',
      es: 'Cerdo',
      pt: 'Porco',
      ja: '豚肉',
      'zh-CN': '猪肉',
      ko: '돼지고기',
      ar: 'لحم الخنزير',
    },
  },
  {
    aliases: ['vegetarisch & vegan'],
    names: {
      de: 'Vegetarisch & Vegan',
      en: 'Vegetarian & Vegan',
      fr: 'Végétarien & Végan',
      it: 'Vegetariano & Vegano',
      es: 'Vegetariano y vegano',
      pt: 'Vegetariano e vegano',
      ja: 'ベジタリアン・ヴィーガン',
      'zh-CN': '素食和纯素',
      ko: '채식 및 비건',
      ar: 'نباتي وفيغان',
    },
  },
]

const glossaryByAlias = new Map<string, RestaurantGlossaryNames>()

for (const entry of RESTAURANT_MENU_GLOSSARY) {
  for (const alias of entry.aliases) {
    glossaryByAlias.set(normalizeRestaurantGlossaryKey(alias), entry.names)
  }
}

const withoutPizzaPrefix = (key: string) => key.replace(/^pizza\s*-\s*/, '')

export function getRestaurantGlossaryNames(input: unknown): RestaurantGlossaryNames | null {
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

export function getRestaurantGlossaryTranslation(input: {
  sourceText: unknown
  targetLanguage: unknown
}) {
  const names = getRestaurantGlossaryNames(input.sourceText)
  const targetLanguage = String(input.targetLanguage ?? '').trim().replace(/_/g, '-')
  return targetLanguage ? String(names?.[targetLanguage] ?? '').trim() : ''
}
