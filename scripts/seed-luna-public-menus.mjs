#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { isAbsolute, join, resolve } from 'node:path'
import { parseArgs } from './_lib/args.mjs'

const DEFAULT_PROJECT_ID = 'misebox-78f9c'
const DEFAULT_SERVICE_ACCOUNT_PATH =
  'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json'
const DEFAULT_DATABASE_ID = 'misebox'
const DEFAULT_KITCHEN_COLLECTION_PATH = 'kitchens'
const LUNA_KITCHEN_ID = 'ChIJ93_ggY-jj0cRTCyLcfBuK2w'
const APP_ID = 'misebox-app'
const SYSTEM_ACTOR = 'system:seed-luna-public-menus'
const STALE_PUBLIC_MENU_NAMES = new Set(['Luna Piccante Menu', 'Pizzakarte'])
const normalizeString = (value) => String(value ?? '').trim()
const normalizeLabelKey = (value) =>
  normalizeString(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[–—]/g, '-')
    .replace(/\s*-\s*/g, ' - ')
    .replace(/\s*[/|]\s*/g, ' / ')
    .replace(/\s*&\s*/g, ' & ')
    .replace(/\s+/g, ' ')

const SECTION_LABELS = new Map(
  [
    ['Antipasti', { de: 'Vorspeisen', en: 'Starter' }],
    ['ANTIPASTI', { de: 'Vorspeisen', en: 'Starter' }],
    ['ANTIPASTI / VORSPEISEN', { de: 'Vorspeisen', en: 'Starter' }],
    ['Zuppa', { de: 'Suppen', en: 'Soups' }],
    ['ZUPPA', { de: 'Suppen', en: 'Soups' }],
    ['ZUPPA / SUPPEN', { de: 'Suppen', en: 'Soups' }],
    ['Insalate', { de: 'Salate', en: 'Salad' }],
    ['INSALATE', { de: 'Salate', en: 'Salad' }],
    ['INSALATE / SALATE', { de: 'Salate', en: 'Salad' }],
    ['Risotto', { de: 'Risotto', en: 'Risotto' }],
    ['RISOTTO', { de: 'Risotto', en: 'Risotto' }],
    ['Gratinato', { de: 'Gratiniert', en: 'Au Gratin' }],
    ['GRATINATO', { de: 'Gratiniert', en: 'Au Gratin' }],
    ['GRATINATO / GRATINIERT', { de: 'Gratiniert', en: 'Au Gratin' }],
    ['Kinder Karte', { de: 'Kinder Karte', en: 'Kids Dish' }],
    ['KINDER KARTE', { de: 'Kinder Karte', en: 'Kids Dish' }],
    ['KINDER KARTE / BAMBINI', { de: 'Kinder Karte', en: 'Kids Dish' }],
    ['Pasta', { de: 'Pasta', en: 'Pasta' }],
    ['PASTA', { de: 'Pasta', en: 'Pasta' }],
    ['Pesce', { de: 'Fisch', en: 'Fish' }],
    ['PESCE', { de: 'Fisch', en: 'Fish' }],
    ['PESCE / FISCH', { de: 'Fisch', en: 'Fish' }],
    ['Carne', { de: 'Fleisch', en: 'Meat' }],
    ['CARNE', { de: 'Fleisch', en: 'Meat' }],
    ['CARNE / FLEISCH', { de: 'Fleisch', en: 'Meat' }],
    ['Heisser Stein', { de: 'Heisser Stein', en: 'Hot Stone' }],
    ['HEISSER STEIN', { de: 'Heisser Stein', en: 'Hot Stone' }],
    ['HEISSER STEIN / SPIESS', { de: 'Heisser Stein / Spiess', en: 'Hot Stone / Skewers' }],
    ['Contorni', { de: 'Beilagen', en: 'Side Dish' }],
    ['CONTORNI', { de: 'Beilagen', en: 'Side Dish' }],
    ['BEILAGEN', { de: 'Beilagen', en: 'Side Dish' }],
    ['Poulet', { de: 'Poulet', en: 'Chicken' }],
    ['Rindsfleisch', { de: 'Rindsfleisch', en: 'Beef' }],
    ['Fisch & Meeresfrüchte', { de: 'Fisch & Meeresfrüchte', en: 'Fish & Seafood' }],
    ['Lammfleisch', { de: 'Lammfleisch', en: 'Lamb' }],
    ['Kalbsfleisch', { de: 'Kalbsfleisch', en: 'Veal' }],
    ['Vegetarisch & Vegan', { de: 'Vegetarisch & Vegan', en: 'Vegetarian & Vegan' }],
    ['Schweinefleisch', { de: 'Schweinefleisch', en: 'Pork' }],
  ].map(([label, labels]) => [normalizeLabelKey(label), labels])
)

function sectionLabels(label) {
  const match = SECTION_LABELS.get(normalizeLabelKey(label))
  return match ? { ...match } : { de: label }
}

function certifiedLanguageMap(value) {
  if (!value || typeof value !== 'object') return {}

  return Object.fromEntries(
    ['de', 'en']
      .map((language) => [language, normalizeString(value[language])])
      .filter(([, text]) => text)
  )
}

const KEEP_UPPERCASE_WORDS = new Set(['BBQ'])
const LOWERCASE_NAME_WORDS = new Set([
  'al',
  'alla',
  'allo',
  'all',
  'd',
  'da',
  'de',
  'del',
  'della',
  'di',
  'e',
  'mit',
])

function splitWordAffixes(value) {
  const match = String(value).match(/^([^A-Za-zÀ-ÖØ-öø-ÿ0-9]*)(.*?)([^A-Za-zÀ-ÖØ-öø-ÿ0-9]*)$/u)
  if (!match) return { prefix: '', core: value, suffix: '' }

  return {
    prefix: match[1] || '',
    core: match[2] || '',
    suffix: match[3] || '',
  }
}

function capitalizeWord(value) {
  if (!value) return ''

  return value.charAt(0).toLocaleUpperCase('de-CH') + value.slice(1)
}

function formatNamePart(value, isFirstWord) {
  const lower = value.toLocaleLowerCase('de-CH')
  if (KEEP_UPPERCASE_WORDS.has(lower.toLocaleUpperCase('de-CH'))) {
    return lower.toLocaleUpperCase('de-CH')
  }
  if (!isFirstWord && LOWERCASE_NAME_WORDS.has(lower)) return lower

  return capitalizeWord(lower)
}

function formatNameWord(value, wordIndex) {
  const { prefix, core, suffix } = splitWordAffixes(value)
  if (!core) return value

  const formatted = core
    .split('-')
    .map((hyphenPart, hyphenIndex) =>
      hyphenPart
        .split(/([´'’])/u)
        .map((part, partIndex, parts) => {
          if (part === '´' || part === "'" || part === '’') return part
          if (!part) return part

          const followsApostrophe =
            partIndex > 0 && ['´', "'", '’'].includes(parts[partIndex - 1])
          const isFirstPart =
            wordIndex === 0 && hyphenIndex === 0 && partIndex === 0

          if (followsApostrophe) {
            return capitalizeWord(part.toLocaleLowerCase('de-CH'))
          }

          return formatNamePart(part, isFirstPart)
        })
        .join('')
    )
    .join('-')

  return `${prefix}${formatted}${suffix}`
}

function naturalDishName(value) {
  return normalizeString(value)
    .split(/(\s+)/u)
    .reduce(
      (acc, part) => {
        if (!part.trim()) {
          acc.parts.push(part)
          return acc
        }

        acc.parts.push(formatNameWord(part, acc.wordIndex))
        acc.wordIndex += 1
        return acc
      },
      { parts: [], wordIndex: 0 }
    )
    .parts.join('')
}

function dish(id, name, description = '') {
  return { id, name, description }
}

const MAIN_SECTIONS = [
  {
    id: 'antipasti',
    label: 'Antipasti',
    items: [
      dish(
        'focaccia-aperitivo-pomodoro-bufala-e-parma',
        'FOCACCIA «APERITIVO» POMODORO, BUFALA E PARMA',
        'Pizzateig an Olivenöl und Knoblauch mit verfeinerten Tomatenwürfeln (mit Zwiebeln, Knoblauch, Basilikum, Olivenöl) dazu Büffel-Mozzarella und Parmaschinken'
      ),
      dish(
        'focaccia-prosciutto-di-parma',
        'FOCACCIA PROSCIUTTO DI PARMA',
        'Pizzateig an Olivenöl und Knoblauch mit Parmaschniken'
      ),
      dish(
        'carpaccio-di-manzo',
        'CARPACCIO DI MANZO',
        'Rindfleisch- Carpaccio mit Grana Padano, Olivenöl, und Zitronensaft garniert mit Rucola'
      ),
      dish(
        'gamberetti-all-aglio',
        'GAMBERETTI ALL´AGLIO',
        'warme Riesenkrevetten im Olivenöl und Knoblauch, serviert auf Rucola und mit gerösteten Brotscheiben'
      ),
      dish(
        'cocktail-di-gamberetti',
        'COCKTAIL DI GAMBERETTI',
        'Krevetten an hausgemachter Cocktailsauce, serviert mit gerösteten Brotscheiben'
      ),
      dish(
        'bruschetta',
        'BRUSCHETTA',
        'mit verfeinerten Tomatenwürfeln an frischen Kräutern (mit Zwiebeln, Knoblauch, Basilikum, Olivenöl) serviert auf hausgemachten, gerösteten Brotscheiben'
      ),
    ],
  },
  {
    id: 'zuppa',
    label: 'Zuppa',
    items: [
      dish('minestrone', 'MINESTRONE', 'Italienische Gemüsesuppe'),
      dish('crema-di-pomodoro', 'CREMA DI POMODORO', 'Tomatencremesuppe'),
    ],
  },
  {
    id: 'insalate',
    label: 'Insalate',
    items: [
      dish('insalata-soncino', 'INSALATA SONCINO', 'Nüsslisalat mit Speck, Ei und Brotcroutons'),
      dish(
        'insalata-caprese',
        'INSALATA CAPRESE',
        'Tomatensalat mit Buffalamozzarella an Basilikum, Olivenöl und Accetto'
      ),
      dish(
        'burrata',
        'BURRATA',
        'Cremige Frischkäse-Spezialität aus Apulien auf Tomaten und Basilikum an Olivenöl'
      ),
      dish('insalata-gigante', 'INSALATA GIGANTE', 'Grosser gemischter Salatteller mit Ei'),
      dish('insalata-verde', 'INSALATA VERDE', 'Grüner Salat'),
      dish('insalata-mista', 'INSALATA MISTA', 'Gemischter Salat'),
    ],
  },
  {
    id: 'risotto',
    label: 'Risotto',
    items: [
      dish('risotto-milanese', 'RISOTTO MILANESE', 'Safranrisotto mit Zwiebeln und Knoblauch'),
      dish(
        'risotto-pollo-e-zafferano',
        'RISOTTO POLLO E ZAFFERANO',
        'Risotto mit Poulet geschnetzeltem, Zwiebeln, Knoblauch an Safransauce und Grana Padano'
      ),
      dish(
        'risotto-porcini',
        'RISOTTO PORCINI',
        'Risotto mit Grana Padano, Steinpilzen, Knoblauch, Zwiebeln'
      ),
    ],
  },
  {
    id: 'gratinato',
    label: 'Gratinato',
    items: [
      dish(
        'gnocchi-piemontese',
        'GNOCCHI PIEMONTESE',
        'mit Steinpilzen, Zwiebeln, Knoblauch an Marsala – und Rahmsauce mit Grana Padano und Mozzarella gratiniert'
      ),
      dish(
        'lasagna-casalinga',
        'LASAGNA CASALINGA',
        'hausgemachte Lasagne mit Rindsfleisch-Füllung mit Grana Padano und Mozzarella gratiniert'
      ),
      dish(
        'cannelloni-fiorentina',
        'CANNELLONI FIORENTINA',
        'hausgemachter Cannelloni gefüllt mit Spinat und Quark an Tomatensauce mit Grana Padano und Mozzarella gratiniert'
      ),
    ],
  },
  {
    id: 'kinder-karte',
    label: 'Kinder Karte',
    items: [
      dish('spaghetti-with-tomato-sauce', 'Spaghetti mit Tomatensauce', 'Spaghetti mit Tomatensauce'),
      dish('kids-spaghetti-bolognese', 'Spaghetti Bolognese', 'Spaghetti Bolognese'),
      dish('kids-spaghetti-carbonara', 'Spaghetti Carbonara', 'Spaghetti Carbonara'),
      dish('kids-spaghetti-al-pesto', 'Spaghetti al Pesto', 'Spaghetti al Pesto'),
      dish('spaghetti-al-burro', 'Spaghetti al burro', 'Spaghetti mit Butter'),
      dish('gnocchi-al-burro', 'GNOCCHI AL BURRO', 'Gnocchi an Butter'),
      dish('capitano', 'CAPITANO', 'Fischstäbchen fritiert mit Pommes Frites'),
      dish('chicken-nuggets', 'CHICKEN NUGGETS', 'mit Pommes Frites'),
      dish('portion-pommes-frites', 'PORTION POMMES FRITES', 'Pommes Frites'),
      dish('risotto-bambini', 'RISOTTO BAMBINI', 'Grana Padano Risotto'),
    ],
  },
  {
    id: 'pasta',
    label: 'Pasta',
    items: [
      dish(
        'paglia-e-fieno-bella-rebecca',
        'PAGLIA E FIENO BELLA REBECCA',
        'Zweifarbige Teigwaren mit Kalbsgeschnetzeltem, Waldpilzen, Zwiebeln, Knoblauch an Rahmsauce'
      ),
      dish(
        'fettuccine-nere-mare-e-monti',
        'FETTUCCINE NERE MARE E MONTI',
        'Schwarze Nudeln mit Krevetten, Steinpilzen Zwiebeln, Knoblauch an Rahmsauce'
      ),
      dish(
        'fettuccine-nere-al-salmone',
        'FETTUCCINE NERE AL SALMONE',
        'Schwarze Nudeln mit Lachs, Zwiebeln, Knoblauch, frischen Kräutern an hausgemachter Tomaten-Rahmsauce'
      ),
      dish(
        'penne-all-arrabbiata',
        'PENNE ALL´ARRABBIATA',
        'Penne mit Speck, Peperoncini, Zwiebeln und Knoblauch an hausgemachter Tomatensauce'
      ),
      dish(
        'penne-imperiale',
        'PENNE IMPERIALE',
        'Penne mit Krevetten, Tomatenwürfeln, Zwiebeln, Knoblauch und frischen Kräutern an hausgemachter Tomaten-Rahmsauce'
      ),
      dish(
        'penne-alla-fiamma',
        'PENNE ALLA FIAMMA',
        'Penne mit flambierten Rindfleischwürfeln, Peperoni, Zwiebeln, Knoblauch, frischen Tomaten, Pilzen, frische Kräuter und Paprika- Rahmsauce'
      ),
      dish(
        'spaghetti-aglio-olio-e-peperoncino',
        'SPAGHETTI AGLIO, OLIO E PEPERONCINO',
        'Spaghetti mit Knoblauch, Oivenöl und Peperoncini'
      ),
      dish(
        'spaghetti-frutti-di-mare',
        'SPAGHETTI FRUTTI DI MARE',
        'Spaghetti mit Meeresfrüchten, Knoblauch, Zwiebeln, Cherrytomaten und Olivenöl an hausgemachter Tomatensauce'
      ),
      dish(
        'spaghetti-carbonara',
        'SPAGHETTI CARBONARA',
        'Spaghetti mit gebratenen Speckwürfeln, Eigelb und Grana Padano an Rahmsauce'
      ),
      dish(
        'spaghetti-vegetariana',
        'SPAGHETTI VEGETARIANA',
        'Spaghetti mit Gemüse, Zwiebeln, Knoblauch an hausgemachter Tomatensauce'
      ),
      dish(
        'spaghetti-napoli',
        'SPAGHETTI NAPOLI',
        'Spaghetti mit hausgemachter Tomatensauce, Zwiebeln, Knoblauch, Basilikum'
      ),
      dish('spaghetti-al-pesto', 'SPAGHETTI AL PESTO', 'Spaghetti an hausgemachter Pestorahmsauce'),
      dish('spaghetti-bolognese', 'SPAGHETTI BOLOGNESE', 'Spaghetti mit würziger, hausgemachter Rinds-Fleischsauce'),
    ],
  },
  {
    id: 'pesce',
    label: 'Pesce',
    items: [
      dish(
        'gamberoni-alla-griglia',
        'GAMBERONI ALLA GRIGLIA',
        'Riesenkrevetten vom Grill, serviert mit Gemüse und Beilage nach Wahl'
      ),
      dish(
        'gamberi-luna-piccante',
        'GAMBERI LUNA PICCANTE',
        'gebratene Riesenkrevetten flambiert mit Cognac mit frischen Peperoncini, Knoblauch, frische Kräuter, Basilikum und Cherrytomaten serviert mit Gemüse und Beilage nach Wahl'
      ),
      dish('salmone-alla-griglia', 'SALMONE ALLA GRIGLIA', 'Lachsfilet vom Grill, serviert mit Gemüse und Beilage nach Wahl'),
    ],
  },
  {
    id: 'carne',
    label: 'Carne',
    items: [
      dish(
        'controfiletto-di-manzo-alla-griglia',
        'CONTROFILETTO DI MANZO ALLA GRIGLIA',
        'Rindsentrecôte vom Grill, serviert mit Gemüse und Beilage nach Wahl'
      ),
      dish(
        'controfiletto-di-manzo-al-pepe-verde',
        'CONTROFILETO DI MANZO AL PEPE VERDE',
        'Rindsentrecôte vom Grill an grün-Pfeffersauce, serviert mit Gemüse und Beilage nach Wahl'
      ),
      dish(
        'controfiletto-d-agnello-alla-griglia',
        'CONTROFILETTO D´AGNELO ALLA GRIGLIA',
        'rosagebratenes Lammnierstück vom Grill serviert mit Gemüse und Beilage nach Wahl'
      ),
      dish(
        'controfiletto-d-agnello-alla-montanara',
        'CONTROFILETTO D´AGNELO ALLA MONTANARA',
        'rosagebratenes Lammnierstück vom Grill an feiner Waldpilzen –Rahmsauce serviert mit Gemüse und Beilage nach Wahl'
      ),
      dish('petto-di-pollo-alla-griglia', 'PETTO DI POLLO ALLA GRIGLIA', 'Pouletbrust vom Grill, serviert mit Gemüse und Beilage nach Wahl'),
      dish('maiale-impanato', 'MAIALE IMPANATO', 'Pannierte Schweinschnitzel, serviert mit Gemüse und Beilage nach Wahl'),
      dish('scaloppina-di-vitello-al-limone', 'SCALOPPINA DI VITELLO AL LIMONE', 'Kalbsschnitzel an feiner Zitronensauce serviert mit Gemüse und Beilage nach Wahl'),
      dish('saltimbocca-alla-romana', 'SALTIMBOCCA ALLA ROMANA', 'Kalbsschnitzel mit Parmaschinken und Salbei an Marsalasauce serviert mit Gemüse und Beilage nach Wahl'),
      dish('scaloppina-di-vitello-alla-crema-di-funghi', 'SCALOPPINA DI VITELLO ALLA CREMA DI FUNGHI', 'Kalbschnitzel an hausgemachter Champignon-Rahmsauce serviert mit Gemüse und Beilage nach Wahl'),
      dish('affettato-alla-zurighese', 'AFFETTATO ALLA ZURIGHESE', '“Zürcher Art“ Kalbsgeschnetzeltes an Champignonrahmsauce serviert mit Gemüse und Beilage nach Wahl'),
    ],
  },
  {
    id: 'heisser-stein',
    label: 'Heisser Stein',
    items: [
      dish('rindsentrecote', 'RINDSENTRECÔTE', 'steak'),
      dish('schweinesteak', 'SCHWEINESTEAK', 'porksteak'),
      dish('lamm-nierstuck', 'LAMM-NIERSTÜCK', 'lamb'),
      dish('rindsfleisch-spiess', 'RINDSFLEISCH SPIESS', 'Beef-spit'),
      dish('gemischter-spiess', 'GEMISCHTER SPIESS', 'SCHWEINS -UND RINDSFLEISCH'),
    ],
  },
  {
    id: 'contorni',
    label: 'Contorni',
    items: [
      dish('contorni-beilagen', 'CONTORNI / BEILAGEN', 'Spaghetti, Penne, Pommes – Frites, Reis, Risotto oder Salat'),
      dish('upgrade-beilagen', 'Upgrade Beilagen', '+3.- Safranrisotto, hausgemachte Pasta, glutenfreie Pasta'),
      dish('zusatzliche-beilage', 'Zusätzliche Beilage', '+6.- je zusätzliche Beilage'),
    ],
  },
]

const MAIN_ENGLISH_DESCRIPTIONS = {
  'focaccia-aperitivo-pomodoro-bufala-e-parma':
    'Pizza dough with tomato cubes, garlic, onions, basil and olive oil, with bufala mozzarella and parma-ham',
  'focaccia-prosciutto-di-parma':
    'Pizza dough on olive oil and garlic with Parma-ham',
  'carpaccio-di-manzo':
    'Beef-carpaccio with parmesan stripes, olive oil and lemon juice on rucola',
  'gamberetti-all-aglio':
    'warm shrimps in olive oil with garlic, served on rucola and with roasted bread.',
  'cocktail-di-gamberetti':
    'Shrimps on homemade cocktail sauce served on roasted bread.',
  bruschetta:
    'tomato cubes with, fresh herbs, garlic, onions, basil and olive oil, served on roasted bread.',
  minestrone:
    'home made Italian vegetable -soup',
  'crema-di-pomodoro':
    'homemade tomato -creamsoup',
  'insalata-soncino':
    'Fieldsalad with bacon, egg and croutons',
  'insalata-caprese':
    'tomato an mozzarella bufala with Basil, olive oil and accetto',
  burrata:
    'Creamy cheese with tomatoes and basil on olive oil',
  'insalata-gigante':
    'Big Salade plate with egg',
  'insalata-verde':
    'Green salad',
  'insalata-mista':
    'Mixed salad',
  'risotto-milanese':
    'Saffron risotto with onions, garlic',
  'risotto-pollo-e-zafferano':
    'Risotto with chicken strips, onions, garlic on saffron sauce and parmesan strips',
  'risotto-porcini':
    'Risotto Grana Padano with porcini, garlic, onion',
  'gnocchi-piemontese':
    'gnocchi with king bolete, onion, garlic on marsala and cream sauce (au gratin)',
  'lasagna-casalinga':
    'homemade beef lasagne with tomato and cream sauce (au gratin)',
  'cannelloni-fiorentina':
    'homemade cannelloni pasta filled with spinach, curd cheese on tomato sauce (au gratin)',
  'spaghetti-with-tomato-sauce':
    'Spaghetti with Tomateosauce',
  'kids-spaghetti-bolognese':
    'Spaghetti Bolognese',
  'kids-spaghetti-carbonara':
    'Spaghetti Carbonara',
  'kids-spaghetti-al-pesto':
    'Spaghetti al Pesto',
  'spaghetti-al-burro':
    'Spaghetti with butter',
  'gnocchi-al-burro':
    'Gnocchi on butter',
  capitano:
    'Fish sticks with French fries.',
  'chicken-nuggets':
    'with French fries',
  'portion-pommes-frites':
    'French fries',
  'risotto-bambini':
    'Risotto with cheese',
  'paglia-e-fieno-bella-rebecca':
    'two-tone pasta with veal stipes, mushrooms, onion, garlic on cream sauce',
  'fettuccine-nere-mare-e-monti':
    'Black noodles with shrimps and king bolete, onion, garlic on cream sauce',
  'fettuccine-nere-al-salmone':
    'Black noodles with salmon, onion, garlic, fresh herbs on homemade tomato-cream sauce',
  'penne-all-arrabbiata':
    'Penne with roasted bacon cubes, fresh chili, onion, and garlic on homemade tomato sauce',
  'penne-imperiale':
    'Penne with shrimps, tomato cube, onion, garlic, fresh herbs, tomato-cream sauce',
  'penne-alla-fiamma':
    'Penne with beef cubes flambé, peppers, onion, garlic, tomato, mushrooms fresh herbs and paprika-cream sauce',
  'spaghetti-aglio-olio-e-peperoncino':
    'Spaghetti with garlic, olive oil, fresh chili',
  'spaghetti-frutti-di-mare':
    'Spaghetti with sea fruits, onion, garlic cherry-tomato, and olive oil on tomato-sauce',
  'spaghetti-carbonara':
    'Spaghetti with roasted bacon cubes, yolk, and grana Padano cheese on cream sauce',
  'spaghetti-vegetariana':
    'Spaghetti with vegetables, onion, garlic, and homemade tomato sauce',
  'spaghetti-napoli':
    'Spaghetti with homemade tomato sauce, onion, garlic, basil.',
  'spaghetti-al-pesto':
    'Spaghetti on homemade pesto cream sauce.',
  'spaghetti-bolognese':
    'Spaghetti with homemade beef sauce',
  'gamberoni-alla-griglia':
    'grilled tiger shrimps, served with vegetables and side dish.',
  'gamberi-luna-piccante':
    'Tiger shrimps flambé, with garlic, fresh herbs, basil, chili, and tomato, served with vegetables and side dish.',
  'salmone-alla-griglia':
    'Grilled salmon served with vegetables and side dish.',
  'controfiletto-di-manzo-alla-griglia':
    'Grilled steak served with vegetables and side dish.',
  'controfiletto-di-manzo-al-pepe-verde':
    'Grilled steak on green pepper sauce served with vegetables and side dish.',
  'controfiletto-d-agnello-alla-griglia':
    'grilled rosa lamp filet, served with vegetables and side dish.',
  'controfiletto-d-agnello-alla-montanara':
    'grilled rosa lamb filet on mushroom sauce, served with vegetables and side dish.',
  'petto-di-pollo-alla-griglia':
    'Grilled chicken breast, served with vegetables and side dish.',
  'maiale-impanato':
    'breaded pork cutlet, served with vegetables and side dish.',
  'scaloppina-di-vitello-al-limone':
    'veal cutlets on lemon cream sauce served with vegetables and side dish.',
  'saltimbocca-alla-romana':
    'Veal cutlet with parma ham and sage on marsala sauce served with vegetables and side dish.',
  'scaloppina-di-vitello-alla-crema-di-funghi':
    'Veal cutlets on champignon cream sauce served with vegetables and side dish.',
  'affettato-alla-zurighese':
    'veal fricassee `zurich style` on champignon cream sauce, served with vegetables and side dish.',
  rindsentrecote:
    'steak',
  schweinesteak:
    'porksteak',
  'lamm-nierstuck':
    'lamb',
  'rindsfleisch-spiess':
    'Beef-spit',
  'gemischter-spiess':
    'Mixed spit with pork and beef',
  'contorni-beilagen':
    'Spaghetti, Penne, french fies, rice, risotto or salad',
  'upgrade-beilagen':
    '+3.- safronrisotto, homemade pasta, glutenfree pasta',
  'zusatzliche-beilage':
    '+6.- further side dish',
}

const PIZZA_SECTIONS = [
  {
    id: 'poulet',
    label: 'Poulet',
    items: [
      dish('curry', 'CURRY', 'Tomatensauce, Mozzarella, Curry-Poulet, Champignons, Origano'),
      dish('bbq', 'BBQ', 'Tomatensauce, Mozzarella, BBQ-Pouletfleisch, Champignons, Zwiebeln, Mais, Origano'),
    ],
  },
  {
    id: 'rindsfleisch',
    label: 'Rindsfleisch',
    items: [
      dish('al-capone', 'AL CAPONE', 'Tomatensauce, Mozzarella, Rindsfleisch, Café de paris, grüner Pfeffer, Origano'),
      dish('lunatico', 'LUNATICO', 'Tomatensauce, Mozzarella, Rindsfleisch, grüner Pfeffer, Origano'),
    ],
  },
  {
    id: 'fisch-meeresfruchte',
    label: 'Fisch & Meeresfrüchte',
    items: [
      dish('napoli', 'NAPOLI', 'Tomatensauce, Mozzarella, Sardellen, Kapern, Origano'),
      dish('salmone', 'SALMONE', 'Tomatensauce, Mozzarella, Rauchlachs, Origano'),
      dish('tonno', 'TONNO', 'Tomatensauce, Mozzarella, Thunfisch, Zwiebelringe, Kapern, Origano'),
      dish('gamberetti', 'GAMBERETTI', 'Tomatensauce, Mozzarella, Krevetten, Knoblauch, Origano'),
      dish('frutti-di-mare', 'FRUTTI DI MARE', 'Tomatensauce, Mozzarella, Meeresfrüchte, Knoblauch, Origano'),
    ],
  },
  {
    id: 'lammfleisch',
    label: 'Lammfleisch',
    items: [
      dish('agnello', 'AGNELLO', 'Tomatensauce, Mozzarella, Lammfleisch-Streifen, Knoblauch, Rosmarin'),
    ],
  },
  {
    id: 'kalbsfleisch',
    label: 'Kalbsfleisch',
    items: [
      dish('casanova', 'CASANOVA', 'Tomatensauce, Mozzarella, Kalbsfleisch, Spinat, Peperoncini, Origano'),
    ],
  },
  {
    id: 'vegetarisch-vegan',
    label: 'Vegetarisch & Vegan',
    items: [
      dish('quattro-formaggi', 'QUATTRO FORMAGGI', 'Tomatensauce, Mozzarella, 3 Käsesorten, Origano'),
      dish('alla-piemontese', 'ALLA PIEMONTESE', 'Tomatensauce, Mozzarella, Steinpilze, Origano'),
      dish('pinocchio', 'PINOCCHIO', 'Tomatensauce, Mozzarella, Oliven, Mais, Paprika, Origano'),
      dish('margherita', 'MARGHERITA', 'Tomatensauce, Mozzarella, Origano'),
      dish('buffala', 'BUFFALA', 'Tomatensauce, Mozzarella, Cherrytomaten, Buffalamozzarella, Basilikum'),
      dish('vegetariana', 'VEGETARIANA', 'Tomatensauce, Mozzarella, Spinat, Peperoni, Aubergine, Origano'),
      dish('caprese', 'CAPRESE', 'Tomatensauce, Mozzarella, Tomatenscheiben, Zwiebeln, Origano'),
      dish('tricolore', 'TRICOLORE', 'Tomatensauce, Mozzarella, Tomatenscheiben, Spinat, Quark, Origano'),
      dish('oliva', 'OLIVA', 'Tomatensauce, Mozzarella, Oliven, Origano'),
      dish('melanzane', 'MELANZANE', 'Tomatensauce, Mozzarella, Aubergine, Knoblauch, Origano'),
      dish('paprika', 'PAPRIKA', 'Tomatensauce, Mozzarella, Paprika, Origano'),
    ],
  },
  {
    id: 'schweinefleisch',
    label: 'Schweinefleisch',
    items: [
      dish('carbonara', 'CARBONARA', 'Tomatensauce, Mozzarella, Speck, Spiegelei, Parmesansplitter, Origano'),
      dish('lucifer', 'LUCIFER', 'Tomatensauce, Mozzarella, Speck, scharfe Salami, frische Peperoncini, Origano'),
      dish('calzone', 'CALZONE', 'zugedeckte Pizza mit Vorderschinken, Quark, Tomatensauce'),
      dish('salame-nostrano', 'SALAME NOSTRANO', 'Tomatensauce, Mozzarella, Salami, Origano'),
      dish('antonio', 'ANTONIO', 'Tomatensauce, Mozzarella, Vorderschinken, Gorgonzola, Birne, Peperoncini, Origano'),
      dish('quattro-stagioni', 'QUATTRO STAGION', 'Tomatensauce, Mozzarella, Vorderschinken, Champignons, Artischocken, Peperoni, Origano'),
      dish('prosciutto', 'PROSCIUTTO', 'Tomatensauce, Mozzarella, Vorderschinken, Origano'),
      dish('prosciutto-e-funghi', 'PROSCIUTTO E FUNGHI', 'Tomatensauce, Mozzarella, Vorderschinken, Champignons, Origano'),
      dish('hawaii', 'HAWAII', 'Tomatensauce, Mozzarella, Vorderschinken, Ananas, Origano'),
      dish('gorgonzola', 'GORGONZOLA', 'Tomatensauce, Mozzarella, Vorderschinken, Gorgonzola, Origano'),
      dish('boscaiolo', 'BOSCAIOLO', 'Tomatensauce, Mozzarella, Salami, Speck, Zwiebeln, Spiegelei, Origano'),
      dish('piccante', 'PICCANTE', 'Tomatensauce, Mozzarella, scharfe Salami, Origano'),
      dish('parma', 'PARMA', 'Tomatensauce, Mozzarella, Parma-Schinken,Origano'),
      dish('parmigiana', 'PARMIGIANA', 'Tomatensauce, Mozzarella, Aubergine, Parma, Grana Padano, Origano'),
    ],
  },
]

const MENUS = [
  {
    id: 'main',
    name: 'Hauptkarte',
    names: {
      de: 'Hauptkarte',
      en: 'Main Menu',
    },
    resetNames: true,
    description: '',
    sortOrder: 10,
    sections: MAIN_SECTIONS,
  },
  {
    id: 'pizza',
    name: 'Pizza',
    names: {
      de: 'Pizza',
      en: 'Pizza',
    },
    resetNames: true,
    description: '',
    sortOrder: 20,
    sections: PIZZA_SECTIONS,
  },
]

function findMonorepoRoot(startDir) {
  let dir = startDir
  for (let i = 0; i < 12; i += 1) {
    if (existsSync(join(dir, 'pnpm-workspace.yaml'))) return dir
    const parent = resolve(dir, '..')
    if (parent === dir) break
    dir = parent
  }
  return startDir
}

function resolveRepoPath(pathValue) {
  const root = findMonorepoRoot(process.cwd())
  const candidates = isAbsolute(pathValue)
    ? [pathValue]
    : [resolve(process.cwd(), pathValue), resolve(root, pathValue)]

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate
  }

  return candidates[0]
}

async function readJsonFile(pathValue, label) {
  const resolvedPath = resolveRepoPath(pathValue)
  if (!existsSync(resolvedPath)) {
    throw new Error(`${label} file not found: ${pathValue}`)
  }

  return {
    data: JSON.parse(await readFile(resolvedPath, 'utf8')),
    resolvedPath,
  }
}

async function readServiceAccount(pathValue) {
  const { data, resolvedPath } = await readJsonFile(pathValue, 'Service account')
  if (!data.project_id || !data.client_email || !data.private_key) {
    throw new Error(`Invalid service account JSON: ${resolvedPath}`)
  }

  return { account: data, resolvedPath }
}

function printHelp() {
  console.log(`
Seed Luna Picante public menus from the source PDFs.

Dry-run by default. Pass --commit to write.

Usage:
  node scripts/seed-luna-public-menus.mjs [--commit] [--menus-only]

Options:
  --commit                         Write Firestore docs.
  --menus-only                     Write kitchen/menu docs only; skip dish docs.
  --project <id>                   Firebase project id.
  --database <id>                  Firestore database id. Defaults to misebox.
  --service-account <path>         Service account JSON path.
  --kitchen-collection <path>      Kitchen collection path. Defaults to kitchens.
`)
}

function updatedStamp() {
  return {
    at: FieldValue.serverTimestamp(),
    by: SYSTEM_ACTOR,
    app_id: APP_ID,
  }
}

function createdStamp(snap) {
  if (snap?.exists && snap.data()?.created) return snap.data().created

  return {
    at: FieldValue.serverTimestamp(),
    by: SYSTEM_ACTOR,
    app_id: APP_ID,
  }
}

function buildSections(sections) {
  return sections.map((section, sectionIndex) => ({
    id: section.id,
    label: section.label,
    labels: sectionLabels(section.label),
    description: '',
    sort_order: sectionIndex + 1,
    items: section.items.map((item, itemIndex) => ({
      id: `${section.id}-${String(itemIndex + 1).padStart(2, '0')}`,
      dish_id: item.id,
      label: '',
      description: '',
      price: 0,
      sort_order: itemIndex + 1,
      active: true,
    })),
  }))
}

function buildMenuPayload(menu, kitchenId, snap) {
  const existing = snap?.exists ? snap.data() || {} : {}
  const existingNames =
    !menu.resetNames && existing.names && typeof existing.names === 'object'
      ? certifiedLanguageMap(existing.names)
      : {}
  const names = certifiedLanguageMap({
    ...existingNames,
    ...(menu.names && typeof menu.names === 'object' ? menu.names : {}),
    de: menu.name,
  })

  return {
    id: menu.id,
    kitchen_id: kitchenId,
    name: menu.name,
    description: menu.description,
    names,
    descriptions: menu.description ? { de: menu.description } : {},
    active: true,
    defaults: {
      active: true,
      description: '',
      photo_url: '',
    },
    service_modes: ['dine_in'],
    sections: buildSections(menu.sections),
    dish_ids: menu.sections.flatMap((section) => section.items.map((item) => item.id)),
    sort_order: menu.sortOrder,
    created: createdStamp(snap),
    updated: updatedStamp(),
  }
}

function buildDishPayload(item, kitchenId, snap) {
  const existing = snap?.exists ? snap.data() || {} : {}
  const description = normalizeString(item.description)
  const name = naturalDishName(item.name)
  const existingDescriptions =
    existing.descriptions && typeof existing.descriptions === 'object'
      ? certifiedLanguageMap(existing.descriptions)
      : {}
  const existingNames =
    existing.names && typeof existing.names === 'object'
      ? certifiedLanguageMap(existing.names)
      : {}
  const englishDescription = normalizeString(MAIN_ENGLISH_DESCRIPTIONS[item.id])
  const descriptions = {
    ...existingDescriptions,
    ...(description ? { de: description } : {}),
    ...(englishDescription ? { en: englishDescription } : {}),
  }

  return {
    id: item.id,
    kitchen_id: kitchenId,
    name,
    slug: item.id,
    description,
    names: {
      ...existingNames,
      de: name,
      en: name,
    },
    descriptions,
    created: createdStamp(snap),
    updated: updatedStamp(),
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help || args.h) {
    printHelp()
    return
  }

  const serviceAccountPath =
    typeof args['service-account'] === 'string'
      ? normalizeString(args['service-account'])
      : process.env.GOOGLE_APPLICATION_CREDENTIALS || DEFAULT_SERVICE_ACCOUNT_PATH
  const { account, resolvedPath: resolvedServiceAccountPath } =
    await readServiceAccount(serviceAccountPath)
  const projectId = normalizeString(
    args.project || process.env.FIREBASE_PROJECT_ID || account.project_id || DEFAULT_PROJECT_ID
  )
  const databaseId =
    typeof args.database === 'string' ? normalizeString(args.database) : DEFAULT_DATABASE_ID
  const kitchenCollectionPath =
    typeof args['kitchen-collection'] === 'string'
      ? normalizeString(args['kitchen-collection'])
      : DEFAULT_KITCHEN_COLLECTION_PATH
  const commit = Boolean(args.commit)
  const menusOnly = Boolean(args['menus-only'] || args.menusOnly)
  const app = initializeApp(
    { credential: cert(account), projectId },
    'seed-luna-public-menus'
  )
  const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app)
  const kitchenRef = db.doc(`${kitchenCollectionPath}/${LUNA_KITCHEN_ID}`)
  const allDishEntries = Array.from(
    new Map(
      MENUS.flatMap((menu) => menu.sections.flatMap((section) => section.items)).map((item) => [
        item.id,
        item,
      ])
    ).values()
  )

  const dishSnaps = menusOnly
    ? []
    : await Promise.all(
        allDishEntries.map((item) => kitchenRef.collection('dishes').doc(item.id).get())
      )
  const menuSnaps = await Promise.all(
    MENUS.map((menu) => kitchenRef.collection('menus').doc(menu.id).get())
  )
  const renamedDishNames = menusOnly
    ? []
    : allDishEntries
        .map((item, index) => {
          const from = normalizeString(dishSnaps[index]?.data()?.name)
          const to = naturalDishName(item.name)

          return from && from !== to ? { id: item.id, from, to } : null
        })
        .filter(Boolean)
  const existingMenusSnap = await kitchenRef.collection('menus').get()
  const canonicalMenuIds = new Set(MENUS.map((menu) => menu.id))
  const staleMenuSnaps = existingMenusSnap.docs.filter((snap) => {
    if (canonicalMenuIds.has(snap.id)) return false

    const name = normalizeString(snap.data()?.name)
    return STALE_PUBLIC_MENU_NAMES.has(name)
  })

  console.log('[seed] luna-public-menus start', {
    commit,
    menusOnly,
    projectId,
    databaseId,
    serviceAccount: resolvedServiceAccountPath,
    kitchenPath: kitchenRef.path,
    menuIds: MENUS.map((menu) => menu.id),
    dishCount: menusOnly ? 0 : allDishEntries.length,
    renamedDishCount: renamedDishNames.length,
  })

  const created = { dishes: [], menus: [] }
  const updated = { dishes: [], menus: [] }
  const deleted = { menus: [] }

  if (commit) {
    const batch = db.batch()
    batch.set(
      kitchenRef,
      {
        name: 'Luna Piccante',
        slug: 'luna-picante',
        slug_aliases: ['luna-piccante'],
        primary_language: 'de',
        language_settings: {
          default_language: 'de',
          supported_languages: ['de', 'en', 'it', 'fr'],
        },
        updated: updatedStamp(),
      },
      { merge: true }
    )

    if (!menusOnly) {
      allDishEntries.forEach((item, index) => {
        const snap = dishSnaps[index]
        batch.set(snap.ref, buildDishPayload(item, LUNA_KITCHEN_ID, snap), { merge: false })
        if (snap.exists) updated.dishes.push(item.id)
        else created.dishes.push(item.id)
      })
    }

    MENUS.forEach((menu, index) => {
      const snap = menuSnaps[index]
      batch.set(snap.ref, buildMenuPayload(menu, LUNA_KITCHEN_ID, snap), { merge: false })
      if (snap.exists) updated.menus.push(menu.id)
      else created.menus.push(menu.id)
    })

    staleMenuSnaps.forEach((snap) => {
      batch.delete(snap.ref)
      deleted.menus.push({
        id: snap.id,
        name: normalizeString(snap.data()?.name),
      })
    })

    await batch.commit()
  }

  console.log('[seed] luna-public-menus done', {
    commit,
    routes: [
      '/kitchens/luna-picante/menus',
      '/kitchens/luna-picante/menus/main',
      '/kitchens/luna-picante/menus/pizza',
    ],
    paths: {
      kitchen: kitchenRef.path,
      dishes: kitchenRef.collection('dishes').path,
      menus: kitchenRef.collection('menus').path,
    },
    created,
    updated,
    deleted,
    renamedDishCount: renamedDishNames.length,
    renamedDishNames,
  })
}

main().catch((error) => {
  console.error('[seed] luna-public-menus failed')
  console.error(error?.message || error)
  process.exitCode = 1
})
