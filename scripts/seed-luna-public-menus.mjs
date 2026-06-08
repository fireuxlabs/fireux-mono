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
    ['Antipasti', { de: 'Vorspeisen', en: 'Starters', it: 'Antipasti' }],
    ['ANTIPASTI', { de: 'Vorspeisen', en: 'Starters', it: 'Antipasti' }],
    ['ANTIPASTI / VORSPEISEN', { de: 'Vorspeisen', en: 'Starters', it: 'Antipasti' }],
    ['Zuppa', { de: 'Suppen', en: 'Soups', it: 'Zuppe' }],
    ['ZUPPA', { de: 'Suppen', en: 'Soups', it: 'Zuppe' }],
    ['ZUPPA / SUPPEN', { de: 'Suppen', en: 'Soups', it: 'Zuppe' }],
    ['Insalate', { de: 'Salate', en: 'Salads', it: 'Insalate' }],
    ['INSALATE', { de: 'Salate', en: 'Salads', it: 'Insalate' }],
    ['INSALATE / SALATE', { de: 'Salate', en: 'Salads', it: 'Insalate' }],
    ['Risotto', { de: 'Risotto', en: 'Risotto', it: 'Risotto' }],
    ['RISOTTO', { de: 'Risotto', en: 'Risotto', it: 'Risotto' }],
    ['Gratinato', { de: 'Gratiniert', en: 'Au Gratin', it: 'Gratinati' }],
    ['GRATINATO', { de: 'Gratiniert', en: 'Au Gratin', it: 'Gratinati' }],
    ['GRATINATO / GRATINIERT', { de: 'Gratiniert', en: 'Au Gratin', it: 'Gratinati' }],
    ['Kinder Karte', { de: 'Kinder Karte', en: 'Kids Menu', it: 'Menu bambini' }],
    ['KINDER KARTE', { de: 'Kinder Karte', en: 'Kids Menu', it: 'Menu bambini' }],
    ['KINDER KARTE / BAMBINI', { de: 'Kinder Karte', en: 'Kids Menu', it: 'Menu bambini' }],
    ['Pasta', { de: 'Pasta', en: 'Pasta', it: 'Pasta' }],
    ['PASTA', { de: 'Pasta', en: 'Pasta', it: 'Pasta' }],
    ['Pesce', { de: 'Fisch', en: 'Fish', it: 'Pesce' }],
    ['PESCE', { de: 'Fisch', en: 'Fish', it: 'Pesce' }],
    ['PESCE / FISCH', { de: 'Fisch', en: 'Fish', it: 'Pesce' }],
    ['Carne', { de: 'Fleisch', en: 'Meat', it: 'Carne' }],
    ['CARNE', { de: 'Fleisch', en: 'Meat', it: 'Carne' }],
    ['CARNE / FLEISCH', { de: 'Fleisch', en: 'Meat', it: 'Carne' }],
    ['Heisser Stein', { de: 'Heisser Stein', en: 'Hot Stone', it: 'Pietra calda' }],
    ['HEISSER STEIN', { de: 'Heisser Stein', en: 'Hot Stone', it: 'Pietra calda' }],
    ['HEISSER STEIN / SPIESS', { de: 'Heisser Stein / Spiess', en: 'Hot Stone / Skewers', it: 'Pietra calda / Spiedini' }],
    ['Contorni', { de: 'Beilagen', en: 'Side Dishes', it: 'Contorni' }],
    ['CONTORNI', { de: 'Beilagen', en: 'Side Dishes', it: 'Contorni' }],
    ['BEILAGEN', { de: 'Beilagen', en: 'Side Dishes', it: 'Contorni' }],
    ['Poulet', { de: 'Poulet', en: 'Chicken', it: 'Pollo' }],
    ['Rindsfleisch', { de: 'Rindsfleisch', en: 'Beef', it: 'Manzo' }],
    ['Fisch & Meeresfrüchte', { de: 'Fisch & Meeresfrüchte', en: 'Fish & Seafood', it: 'Pesce e frutti di mare' }],
    ['Lammfleisch', { de: 'Lammfleisch', en: 'Lamb', it: 'Agnello' }],
    ['Kalbsfleisch', { de: 'Kalbsfleisch', en: 'Veal', it: 'Vitello' }],
    ['Vegetarisch & Vegan', { de: 'Vegetarisch & Vegan', en: 'Vegetarian & Vegan', it: 'Vegetariano e vegano' }],
    ['Schweinefleisch', { de: 'Schweinefleisch', en: 'Pork', it: 'Maiale' }],
  ].map(([label, labels]) => [normalizeLabelKey(label), labels])
)

function sectionLabels(label) {
  const match = SECTION_LABELS.get(normalizeLabelKey(label))
  return match ? { ...match } : { de: label }
}

function certifiedLanguageMap(value) {
  if (!value || typeof value !== 'object') return {}

  return Object.fromEntries(
    ['de', 'en', 'it']
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

function menuLine(id, label, description = '', translations = {}) {
  return {
    id,
    label,
    description,
    labels: translations.labels || {},
    descriptions: translations.descriptions || {},
    inline: true,
  }
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
        'Pizzateig an Olivenöl und Knoblauch mit Parmaschinken'
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
        'Tomatensalat mit Buffalamozzarella an Basilikum, Olivenöl und Aceto'
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
      dish('capitano', 'CAPITANO', 'Fischstäbchen frittiert mit Pommes Frites'),
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
        'Schwarze Nudeln mit Krevetten, Steinpilzen, Zwiebeln, Knoblauch an Rahmsauce'
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
        'Penne mit flambierten Rindfleischwürfeln, Peperoni, Zwiebeln, Knoblauch, frischen Tomaten, Pilzen, frische Kräuter und Paprika-Rahmsauce'
      ),
      dish(
        'spaghetti-aglio-olio-e-peperoncino',
        'SPAGHETTI AGLIO, OLIO E PEPERONCINO',
        'Spaghetti mit Knoblauch, Olivenöl und Peperoncini'
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
        'CONTROFILETTO DI MANZO AL PEPE VERDE',
        'Rindsentrecôte vom Grill an Grünpfeffersauce, serviert mit Gemüse und Beilage nach Wahl'
      ),
      dish(
        'controfiletto-d-agnello-alla-griglia',
        'CONTROFILETTO D´AGNELLO ALLA GRIGLIA',
        'rosagebratenes Lammnierstück vom Grill serviert mit Gemüse und Beilage nach Wahl'
      ),
      dish(
        'controfiletto-d-agnello-alla-montanara',
        'CONTROFILETTO D´AGNELLO ALLA MONTANARA',
        'rosagebratenes Lammnierstück vom Grill an feiner Waldpilz-Rahmsauce serviert mit Gemüse und Beilage nach Wahl'
      ),
      dish('petto-di-pollo-alla-griglia', 'PETTO DI POLLO ALLA GRIGLIA', 'Pouletbrust vom Grill, serviert mit Gemüse und Beilage nach Wahl'),
      dish('maiale-impanato', 'MAIALE IMPANATO', 'Panierte Schweinsschnitzel, serviert mit Gemüse und Beilage nach Wahl'),
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
      dish('rindsentrecote', 'RINDSENTRECÔTE', 'Steak'),
      dish('schweinesteak', 'SCHWEINESTEAK', 'Schweinesteak'),
      dish('lamm-nierstuck', 'LAMM-NIERSTÜCK', 'Lamm'),
      dish('rindsfleisch-spiess', 'RINDSFLEISCH SPIESS', 'Rindsfleisch-Spiess'),
      dish('gemischter-spiess', 'GEMISCHTER SPIESS', 'Schweins- und Rindsfleisch'),
    ],
  },
  {
    id: 'contorni',
    label: 'Contorni',
    items: [
      menuLine(
        'contorni-01',
        'Contorni / Beilagen',
        'Spaghetti, Penne, Pommes – Frites, Reis, Risotto oder Salat',
        {
          labels: {
            de: 'Beilagen',
            en: 'Side dishes',
            it: 'Contorni',
          },
          descriptions: {
            de: 'Spaghetti, Penne, Pommes – Frites, Reis, Risotto oder Salat',
            en: 'Spaghetti, penne, French fries, rice, risotto or salad',
            it: 'Spaghetti, penne, patatine fritte, riso, risotto o insalata',
          },
        }
      ),
      menuLine(
        'contorni-02',
        'Upgrade Beilagen',
        '+3.- Safranrisotto, hausgemachte Pasta, glutenfreie Pasta',
        {
          labels: {
            de: 'Upgrade Beilagen',
            en: 'Upgrade sides',
            it: 'Supplemento contorni',
          },
          descriptions: {
            de: '+3.- Safranrisotto, hausgemachte Pasta, glutenfreie Pasta',
            en: '+3.- saffron risotto, homemade pasta, gluten-free pasta',
            it: '+3.- risotto allo zafferano, pasta fatta in casa, pasta senza glutine',
          },
        }
      ),
      menuLine(
        'contorni-03',
        'Zusätzliche Beilage',
        '+6.- je zusätzliche Beilage',
        {
          labels: {
            de: 'Zusätzliche Beilage',
            en: 'Additional side dish',
            it: 'Contorno aggiuntivo',
          },
          descriptions: {
            de: '+6.- je zusätzliche Beilage',
            en: '+6.- per additional side dish',
            it: '+6.- per ogni contorno aggiuntivo',
          },
        }
      ),
    ],
  },
]

const MAIN_ENGLISH_DESCRIPTIONS = {
  'focaccia-aperitivo-pomodoro-bufala-e-parma':
    'Pizza dough with tomato cubes, garlic, onions, basil and olive oil, with buffalo mozzarella and Parma ham',
  'focaccia-prosciutto-di-parma':
    'Pizza dough on olive oil and garlic with Parma ham',
  'carpaccio-di-manzo':
    'Beef carpaccio with Grana Padano shavings, olive oil and lemon juice, served with rocket',
  'gamberetti-all-aglio':
    'Warm prawns in olive oil and garlic, served on rocket with toasted bread',
  'cocktail-di-gamberetti':
    'Prawns with homemade cocktail sauce, served with toasted bread',
  bruschetta:
    'tomato cubes with, fresh herbs, garlic, onions, basil and olive oil, served on roasted bread.',
  minestrone:
    'homemade Italian vegetable soup',
  'crema-di-pomodoro':
    'homemade tomato cream soup',
  'insalata-soncino':
    'Fieldsalad with bacon, egg and croutons',
  'insalata-caprese':
    'tomato and buffalo mozzarella with basil, olive oil and Aceto',
  burrata:
    'Creamy cheese with tomatoes and basil on olive oil',
  'insalata-gigante':
    'Large mixed salad plate with egg',
  'insalata-verde':
    'Green salad',
  'insalata-mista':
    'Mixed salad',
  'risotto-milanese':
    'Saffron risotto with onions, garlic',
  'risotto-pollo-e-zafferano':
    'risotto with chicken strips, onions and garlic in saffron sauce with Grana Padano',
  'risotto-porcini':
    'Risotto Grana Padano with porcini, garlic, onion',
  'gnocchi-piemontese':
    'gnocchi with porcini mushrooms, onion and garlic in Marsala cream sauce, au gratin',
  'lasagna-casalinga':
    'homemade beef lasagne with tomato and cream sauce (au gratin)',
  'cannelloni-fiorentina':
    'homemade cannelloni pasta filled with spinach, curd cheese on tomato sauce (au gratin)',
  'spaghetti-with-tomato-sauce':
    'Spaghetti with tomato sauce',
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
    'two-tone pasta with veal strips, mushrooms, onion, garlic on cream sauce',
  'fettuccine-nere-mare-e-monti':
    'Black noodles with shrimps and porcini mushrooms, onion and garlic in cream sauce',
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
    'Spaghetti with seafood, onion, garlic, cherry tomato, and olive oil on tomato sauce',
  'spaghetti-carbonara':
    'Spaghetti with roasted bacon cubes, yolk, and Grana Padano cheese on cream sauce',
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
    'grilled rare lamb fillet, served with vegetables and side dish.',
  'controfiletto-d-agnello-alla-montanara':
    'grilled rosa lamb filet on mushroom sauce, served with vegetables and side dish.',
  'petto-di-pollo-alla-griglia':
    'Grilled chicken breast, served with vegetables and side dish.',
  'maiale-impanato':
    'breaded pork cutlet, served with vegetables and side dish.',
  'scaloppina-di-vitello-al-limone':
    'veal cutlets on lemon cream sauce served with vegetables and side dish.',
  'saltimbocca-alla-romana':
    'Veal cutlet with Parma ham and sage on marsala sauce served with vegetables and side dish.',
  'scaloppina-di-vitello-alla-crema-di-funghi':
    'Veal cutlets on champignon cream sauce served with vegetables and side dish.',
  'affettato-alla-zurighese':
    'veal fricassee `zurich style` on champignon cream sauce, served with vegetables and side dish.',
  rindsentrecote:
    'Steak',
  schweinesteak:
    'Pork steak',
  'lamm-nierstuck':
    'Lamb',
  'rindsfleisch-spiess':
    'Beef skewer',
  'gemischter-spiess':
    'Mixed skewer with pork and beef',
  'contorni-beilagen':
    'Spaghetti, penne, French fries, rice, risotto or salad',
  'upgrade-beilagen':
    '+3.- saffron risotto, homemade pasta, gluten-free pasta',
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
      dish('quattro-stagioni', 'QUATTRO STAGIONI', 'Tomatensauce, Mozzarella, Vorderschinken, Champignons, Artischocken, Peperoni, Origano'),
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

const PIZZA_ENGLISH_DESCRIPTIONS = {
  curry:
    'tomato sauce, mozzarella, curry chicken, mushrooms, oregano',
  bbq:
    'tomato sauce, mozzarella, BBQ chicken, mushrooms, onion, corn, oregano',
  'al-capone':
    'tomato sauce, mozzarella, beef strips, Café de Paris, green peppercorn, oregano',
  lunatico:
    'tomato sauce, mozzarella, beef strips, green peppercorn, oregano',
  napoli:
    'tomato sauce, mozzarella, anchovies, capers, olives, oregano',
  salmone:
    'tomato sauce, mozzarella, smoked salmon, onion, oregano',
  tonno:
    'tomato sauce, mozzarella, tuna, onion, capers, oregano',
  gamberetti:
    'tomato sauce, mozzarella, shrimps, garlic, oregano',
  'frutti-di-mare':
    'tomato sauce, mozzarella, seafood, garlic, oregano',
  agnello:
    'tomato sauce, mozzarella, lamb strips, garlic, rosemary',
  casanova:
    'tomato sauce, mozzarella, veal strips, spinach, chili, oregano',
  'quattro-formaggi':
    'tomato sauce, mozzarella, three different cheeses, oregano',
  'alla-piemontese':
    'tomato sauce, mozzarella, porcini mushrooms, oregano',
  pinocchio:
    'tomato sauce, mozzarella, corn, olives, red peppers, oregano',
  margherita:
    'tomato sauce, mozzarella, oregano',
  buffala:
    'tomato sauce, mozzarella, cherry tomatoes, buffalo mozzarella, basil',
  vegetariana:
    'tomato sauce, mozzarella, spinach, red pepper, eggplant, oregano',
  caprese:
    'tomato sauce, mozzarella, tomato, onions, oregano',
  tricolore:
    'tomato sauce, mozzarella, fresh tomato, spinach, curd cheese, oregano',
  oliva:
    'tomato sauce, mozzarella, black olives, oregano',
  melanzane:
    'tomato sauce, mozzarella, eggplant, garlic, oregano',
  paprika:
    'tomato sauce, mozzarella, red peppers, oregano',
  carbonara:
    'tomato sauce, mozzarella, bacon, egg, Grana Padano, oregano',
  lucifer:
    'tomato sauce, mozzarella, bacon, spicy salami, chili, oregano',
  calzone:
    'covered pizza with mozzarella, curd cheese, ham, tomato sauce',
  'salame-nostrano':
    'tomato sauce, mozzarella, salami, oregano',
  antonio:
    'tomato sauce, mozzarella, ham, Gorgonzola, pear, chili, oregano',
  'quattro-stagioni':
    'tomato sauce, mozzarella, ham, mushrooms, artichokes, red pepper, oregano',
  prosciutto:
    'tomato sauce, mozzarella, ham, oregano',
  'prosciutto-e-funghi':
    'tomato sauce, mozzarella, ham, mushrooms, oregano',
  hawaii:
    'tomato sauce, mozzarella, ham, pineapple, oregano',
  gorgonzola:
    'tomato sauce, mozzarella, ham, Gorgonzola cheese, oregano',
  boscaiolo:
    'tomato sauce, mozzarella, salami, bacon, onion, egg, oregano',
  piccante:
    'tomato sauce, mozzarella, spicy salami, oregano',
  parma:
    'tomato sauce, mozzarella, Parma ham, oregano',
  parmigiana:
    'tomato sauce, mozzarella, eggplant, Parma ham, Grana Padano, oregano',
}

const ENGLISH_DESCRIPTIONS = {
  ...MAIN_ENGLISH_DESCRIPTIONS,
  ...PIZZA_ENGLISH_DESCRIPTIONS,
}

const MAIN_ITALIAN_DESCRIPTIONS = {
  'focaccia-aperitivo-pomodoro-bufala-e-parma':
    'Pasta per pizza con olio d’oliva e aglio, dadini di pomodoro con cipolle, aglio, basilico e olio d’oliva, mozzarella di bufala e prosciutto di Parma',
  'focaccia-prosciutto-di-parma':
    'Pasta per pizza con olio d’oliva e aglio e prosciutto di Parma',
  'carpaccio-di-manzo':
    'Carpaccio di manzo con Grana Padano, olio d’oliva e succo di limone, guarnito con rucola',
  'gamberetti-all-aglio':
    'Gamberoni caldi in olio d’oliva e aglio, serviti su rucola con fette di pane tostato',
  'cocktail-di-gamberetti':
    'Gamberetti con salsa cocktail fatta in casa, serviti con fette di pane tostato',
  bruschetta:
    'Dadini di pomodoro con erbe fresche, cipolle, aglio, basilico e olio d’oliva, serviti su fette di pane casereccio tostato',
  minestrone:
    'Minestrone di verdure all’italiana fatto in casa',
  'crema-di-pomodoro':
    'Crema di pomodoro fatta in casa',
  'insalata-soncino':
    'Insalata di valerianella con speck, uovo e crostini',
  'insalata-caprese':
    'Insalata di pomodori con mozzarella di bufala, basilico, olio d’oliva e aceto',
  burrata:
    'Specialità cremosa di formaggio fresco pugliese su pomodori e basilico con olio d’oliva',
  'insalata-gigante':
    'Grande piatto di insalata mista con uovo',
  'insalata-verde':
    'Insalata verde',
  'insalata-mista':
    'Insalata mista',
  'risotto-milanese':
    'Risotto allo zafferano con cipolle e aglio',
  'risotto-pollo-e-zafferano':
    'Risotto con straccetti di pollo, cipolle e aglio in salsa allo zafferano e Grana Padano',
  'risotto-porcini':
    'Risotto con Grana Padano, funghi porcini, aglio e cipolle',
  'gnocchi-piemontese':
    'Gnocchi con funghi porcini, cipolle e aglio in salsa al Marsala e panna, gratinati con Grana Padano e mozzarella',
  'lasagna-casalinga':
    'Lasagna fatta in casa con ripieno di manzo, gratinata con Grana Padano e mozzarella',
  'cannelloni-fiorentina':
    'Cannelloni fatti in casa ripieni di spinaci e ricotta, in salsa di pomodoro, gratinati con Grana Padano e mozzarella',
  'spaghetti-with-tomato-sauce':
    'Spaghetti al pomodoro',
  'kids-spaghetti-bolognese':
    'Spaghetti alla bolognese',
  'kids-spaghetti-carbonara':
    'Spaghetti alla carbonara',
  'kids-spaghetti-al-pesto':
    'Spaghetti al pesto',
  'spaghetti-al-burro':
    'Spaghetti al burro',
  'gnocchi-al-burro':
    'Gnocchi al burro',
  capitano:
    'Bastoncini di pesce fritti con patatine fritte',
  'chicken-nuggets':
    'Con patatine fritte',
  'portion-pommes-frites':
    'Patatine fritte',
  'risotto-bambini':
    'Risotto al Grana Padano',
  'paglia-e-fieno-bella-rebecca':
    'Pasta bicolore con straccetti di vitello, funghi di bosco, cipolle e aglio in salsa alla panna',
  'fettuccine-nere-mare-e-monti':
    'Fettuccine nere con gamberetti, funghi porcini, cipolle e aglio in salsa alla panna',
  'fettuccine-nere-al-salmone':
    'Fettuccine nere con salmone, cipolle, aglio ed erbe fresche in salsa di pomodoro e panna fatta in casa',
  'penne-all-arrabbiata':
    'Penne con speck, peperoncini, cipolle e aglio in salsa di pomodoro fatta in casa',
  'penne-imperiale':
    'Penne con gamberetti, dadini di pomodoro, cipolle, aglio ed erbe fresche in salsa di pomodoro e panna fatta in casa',
  'penne-alla-fiamma':
    'Penne con dadini di manzo flambé, peperoni, cipolle, aglio, pomodori freschi, funghi, erbe fresche e salsa alla panna e paprika',
  'spaghetti-aglio-olio-e-peperoncino':
    'Spaghetti con aglio, olio d’oliva e peperoncini',
  'spaghetti-frutti-di-mare':
    'Spaghetti con frutti di mare, aglio, cipolle, pomodorini e olio d’oliva in salsa di pomodoro fatta in casa',
  'spaghetti-carbonara':
    'Spaghetti con dadini di speck rosolati, tuorlo d’uovo e Grana Padano in salsa alla panna',
  'spaghetti-vegetariana':
    'Spaghetti con verdure, cipolle e aglio in salsa di pomodoro fatta in casa',
  'spaghetti-napoli':
    'Spaghetti con salsa di pomodoro fatta in casa, cipolle, aglio e basilico',
  'spaghetti-al-pesto':
    'Spaghetti in salsa cremosa al pesto fatta in casa',
  'spaghetti-bolognese':
    'Spaghetti con salsa di manzo fatta in casa e speziata',
  'gamberoni-alla-griglia':
    'Gamberoni alla griglia, serviti con verdure e contorno a scelta',
  'gamberi-luna-piccante':
    'Gamberoni saltati e flambé al cognac con peperoncini freschi, aglio, erbe fresche, basilico e pomodorini, serviti con verdure e contorno a scelta',
  'salmone-alla-griglia':
    'Filetto di salmone alla griglia, servito con verdure e contorno a scelta',
  'controfiletto-di-manzo-alla-griglia':
    'Entrecôte di manzo alla griglia, servita con verdure e contorno a scelta',
  'controfiletto-di-manzo-al-pepe-verde':
    'Entrecôte di manzo alla griglia con salsa al pepe verde, servita con verdure e contorno a scelta',
  'controfiletto-d-agnello-alla-griglia':
    'Filetto di agnello alla griglia, cottura rosa, servito con verdure e contorno a scelta',
  'controfiletto-d-agnello-alla-montanara':
    'Filetto di agnello alla griglia, cottura rosa, con delicata salsa alla panna e funghi di bosco, servito con verdure e contorno a scelta',
  'petto-di-pollo-alla-griglia':
    'Petto di pollo alla griglia, servito con verdure e contorno a scelta',
  'maiale-impanato':
    'Scaloppine di maiale impanate, servite con verdure e contorno a scelta',
  'scaloppina-di-vitello-al-limone':
    'Scaloppina di vitello in delicata salsa al limone, servita con verdure e contorno a scelta',
  'saltimbocca-alla-romana':
    'Scaloppina di vitello con prosciutto di Parma e salvia in salsa al Marsala, servita con verdure e contorno a scelta',
  'scaloppina-di-vitello-alla-crema-di-funghi':
    'Scaloppina di vitello in salsa cremosa ai champignon fatta in casa, servita con verdure e contorno a scelta',
  'affettato-alla-zurighese':
    'Straccetti di vitello alla zurighese in salsa alla panna e champignon, serviti con verdure e contorno a scelta',
  rindsentrecote:
    'Bistecca',
  schweinesteak:
    'Bistecca di maiale',
  'lamm-nierstuck':
    'Agnello',
  'rindsfleisch-spiess':
    'Spiedino di manzo',
  'gemischter-spiess':
    'Spiedino misto di maiale e manzo',
}

const PIZZA_ITALIAN_DESCRIPTIONS = {
  curry:
    'Salsa di pomodoro, mozzarella, pollo al curry, champignon, origano',
  bbq:
    'Salsa di pomodoro, mozzarella, pollo BBQ, champignon, cipolle, mais, origano',
  'al-capone':
    'Salsa di pomodoro, mozzarella, straccetti di manzo, Café de Paris, pepe verde, origano',
  lunatico:
    'Salsa di pomodoro, mozzarella, straccetti di manzo, pepe verde, origano',
  napoli:
    'Salsa di pomodoro, mozzarella, acciughe, capperi, origano',
  salmone:
    'Salsa di pomodoro, mozzarella, salmone affumicato, origano',
  tonno:
    'Salsa di pomodoro, mozzarella, tonno, anelli di cipolla, capperi, origano',
  gamberetti:
    'Salsa di pomodoro, mozzarella, gamberetti, aglio, origano',
  'frutti-di-mare':
    'Salsa di pomodoro, mozzarella, frutti di mare, aglio, origano',
  agnello:
    'Salsa di pomodoro, mozzarella, straccetti di agnello, aglio, rosmarino',
  casanova:
    'Salsa di pomodoro, mozzarella, vitello, spinaci, peperoncini, origano',
  'quattro-formaggi':
    'Salsa di pomodoro, mozzarella, 3 tipi di formaggio, origano',
  'alla-piemontese':
    'Salsa di pomodoro, mozzarella, funghi porcini, origano',
  pinocchio:
    'Salsa di pomodoro, mozzarella, olive, mais, peperoni, origano',
  margherita:
    'Salsa di pomodoro, mozzarella, origano',
  buffala:
    'Salsa di pomodoro, mozzarella, pomodorini, mozzarella di bufala, basilico',
  vegetariana:
    'Salsa di pomodoro, mozzarella, spinaci, peperoni, melanzane, origano',
  caprese:
    'Salsa di pomodoro, mozzarella, fette di pomodoro, cipolle, origano',
  tricolore:
    'Salsa di pomodoro, mozzarella, fette di pomodoro, spinaci, ricotta, origano',
  oliva:
    'Salsa di pomodoro, mozzarella, olive, origano',
  melanzane:
    'Salsa di pomodoro, mozzarella, melanzane, aglio, origano',
  paprika:
    'Salsa di pomodoro, mozzarella, peperoni, origano',
  carbonara:
    'Salsa di pomodoro, mozzarella, speck, uovo all’occhio di bue, scaglie di Grana Padano, origano',
  lucifer:
    'Salsa di pomodoro, mozzarella, speck, salame piccante, peperoncini freschi, origano',
  calzone:
    'Pizza chiusa con prosciutto cotto, ricotta e salsa di pomodoro',
  'salame-nostrano':
    'Salsa di pomodoro, mozzarella, salame, origano',
  antonio:
    'Salsa di pomodoro, mozzarella, prosciutto cotto, Gorgonzola, pera, peperoncini, origano',
  'quattro-stagioni':
    'Salsa di pomodoro, mozzarella, prosciutto cotto, champignon, carciofi, peperoni, origano',
  prosciutto:
    'Salsa di pomodoro, mozzarella, prosciutto cotto, origano',
  'prosciutto-e-funghi':
    'Salsa di pomodoro, mozzarella, prosciutto cotto, champignon, origano',
  hawaii:
    'Salsa di pomodoro, mozzarella, prosciutto cotto, ananas, origano',
  gorgonzola:
    'Salsa di pomodoro, mozzarella, prosciutto cotto, Gorgonzola, origano',
  boscaiolo:
    'Salsa di pomodoro, mozzarella, salame, speck, cipolle, uovo all’occhio di bue, origano',
  piccante:
    'Salsa di pomodoro, mozzarella, salame piccante, origano',
  parma:
    'Salsa di pomodoro, mozzarella, prosciutto di Parma, origano',
  parmigiana:
    'Salsa di pomodoro, mozzarella, melanzane, prosciutto di Parma, Grana Padano, origano',
}

const ITALIAN_DESCRIPTIONS = {
  ...MAIN_ITALIAN_DESCRIPTIONS,
  ...PIZZA_ITALIAN_DESCRIPTIONS,
}

const ITALIAN_NAMES = {
  'spaghetti-with-tomato-sauce': 'Spaghetti al pomodoro',
  'kids-spaghetti-bolognese': 'Spaghetti alla bolognese',
  'kids-spaghetti-carbonara': 'Spaghetti alla carbonara',
  'kids-spaghetti-al-pesto': 'Spaghetti al pesto',
  'portion-pommes-frites': 'Porzione di patatine fritte',
  'controfiletto-di-manzo-al-pepe-verde': 'Controfiletto di Manzo al Pepe Verde',
  'controfiletto-d-agnello-alla-griglia': 'Controfiletto d’Agnello alla Griglia',
  'controfiletto-d-agnello-alla-montanara': 'Controfiletto d’Agnello alla Montanara',
  rindsentrecote: 'Entrecôte di manzo',
  schweinesteak: 'Bistecca di maiale',
  'lamm-nierstuck': 'Filetto di agnello',
  'rindsfleisch-spiess': 'Spiedino di manzo',
  'gemischter-spiess': 'Spiedino misto',
}

const MENU_ITEM_PRICES = {
  'focaccia-aperitivo-pomodoro-bufala-e-parma': 27,
  'focaccia-prosciutto-di-parma': 17,
  'carpaccio-di-manzo': 23,
  'gamberetti-all-aglio': 20,
  'cocktail-di-gamberetti': 19,
  bruschetta: {
    price_options: [
      { quantity: 3, unit: 'piece', price: 10 },
      { quantity: 4, unit: 'piece', price: 13 },
      { quantity: 5, unit: 'piece', price: 16 },
    ],
  },
  minestrone: 10,
  'crema-di-pomodoro': 10,
  'insalata-soncino': 14,
  'insalata-caprese': 19,
  burrata: 20,
  'insalata-gigante': 21,
  'insalata-verde': 9,
  'insalata-mista': 10,
  'risotto-milanese': 24,
  'risotto-pollo-e-zafferano': 28,
  'risotto-porcini': 28,
  'gnocchi-piemontese': 28,
  'lasagna-casalinga': 26,
  'cannelloni-fiorentina': 26,
  'spaghetti-with-tomato-sauce': 10,
  'kids-spaghetti-bolognese': 12,
  'kids-spaghetti-carbonara': 12,
  'kids-spaghetti-al-pesto': 12,
  'spaghetti-al-burro': 10,
  'gnocchi-al-burro': 11,
  capitano: 12,
  'chicken-nuggets': 12,
  'portion-pommes-frites': 9,
  'risotto-bambini': 11,
  'paglia-e-fieno-bella-rebecca': 29,
  'fettuccine-nere-mare-e-monti': 31,
  'fettuccine-nere-al-salmone': 29,
  'penne-all-arrabbiata': 22,
  'penne-imperiale': 27,
  'penne-alla-fiamma': 26,
  'spaghetti-aglio-olio-e-peperoncino': 18,
  'spaghetti-frutti-di-mare': 29,
  'spaghetti-carbonara': 22,
  'spaghetti-vegetariana': 23,
  'spaghetti-napoli': 18,
  'spaghetti-al-pesto': 19,
  'spaghetti-bolognese': 22,
  'gamberoni-alla-griglia': 45,
  'gamberi-luna-piccante': 48,
  'salmone-alla-griglia': 37,
  'controfiletto-di-manzo-alla-griglia': 45,
  'controfiletto-di-manzo-al-pepe-verde': 47,
  'controfiletto-d-agnello-alla-griglia': 43,
  'controfiletto-d-agnello-alla-montanara': 45,
  'petto-di-pollo-alla-griglia': 29,
  'maiale-impanato': 34,
  'scaloppina-di-vitello-al-limone': 39,
  'saltimbocca-alla-romana': 39,
  'scaloppina-di-vitello-alla-crema-di-funghi': 39,
  'affettato-alla-zurighese': 36,
  rindsentrecote: {
    price_options: [
      { quantity: 300, unit: 'gram', price: 57 },
      { quantity: 400, unit: 'gram', price: 66 },
    ],
  },
  schweinesteak: {
    price_options: [
      { quantity: 300, unit: 'gram', price: 47 },
      { quantity: 400, unit: 'gram', price: 56 },
    ],
  },
  'lamm-nierstuck': {
    price_options: [
      { quantity: 300, unit: 'gram', price: 54 },
      { quantity: 400, unit: 'gram', price: 63 },
    ],
  },
  'rindsfleisch-spiess': 49,
  'gemischter-spiess': 41,
  curry: 25,
  bbq: 26,
  'al-capone': 29,
  lunatico: 27,
  napoli: 21,
  salmone: 24,
  tonno: 21,
  gamberetti: 27,
  'frutti-di-mare': 25,
  agnello: 27,
  casanova: 26,
  'quattro-formaggi': 22,
  'alla-piemontese': 23,
  pinocchio: 23,
  margherita: 16,
  buffala: 25,
  vegetariana: 24,
  caprese: 21,
  tricolore: 22,
  oliva: 18,
  melanzane: 21,
  paprika: 21,
  carbonara: 23,
  lucifer: 24,
  calzone: 21,
  'salame-nostrano': 21,
  antonio: 23,
  'quattro-stagioni': 23,
  prosciutto: 20,
  'prosciutto-e-funghi': 21,
  hawaii: 21,
  gorgonzola: 22,
  boscaiolo: 25,
  piccante: 22,
  parma: 24,
  parmigiana: 25,
}

const MENUS = [
  {
    id: 'main',
    name: 'Hauptkarte',
    names: {
      de: 'Hauptkarte',
      en: 'Main Menu',
      it: 'Menù principale',
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
      it: 'Pizza',
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

function menuItemPrice(itemId) {
  const priceConfig = MENU_ITEM_PRICES[itemId]
  if (typeof priceConfig === 'number') return { price: priceConfig }
  if (!priceConfig || typeof priceConfig !== 'object') return { price: 0 }
  if (Array.isArray(priceConfig.price_options)) {
    return {
      price_options: priceConfig.price_options.map((option) => ({
        quantity: Number(option.quantity ?? 0) || 0,
        unit: normalizeString(option.unit),
        price: Number(option.price ?? 0) || 0,
      })),
    }
  }

  return {
    price: Number(priceConfig.price ?? 0) || 0,
  }
}

function buildSections(sections) {
  return sections.map((section, sectionIndex) => ({
    id: section.id,
    label: section.label,
    labels: sectionLabels(section.label),
    description: '',
    sort_order: sectionIndex + 1,
    items: section.items.map((item, itemIndex) => {
      const itemBase = {
        id: item.inline
          ? item.id
          : `${section.id}-${String(itemIndex + 1).padStart(2, '0')}`,
        label: item.inline ? item.label : '',
        description: item.inline ? item.description : '',
        ...menuItemPrice(item.id),
        sort_order: itemIndex + 1,
        active: true,
      }

      return item.inline
        ? {
            ...itemBase,
            labels: certifiedLanguageMap(item.labels),
            descriptions: certifiedLanguageMap(item.descriptions),
          }
        : {
            ...itemBase,
            dish_id: item.id,
          }
    }),
  }))
}

function buildMenuPayload(menu, kitchenId, snap) {
  return {
    id: menu.id,
    kitchen_id: kitchenId,
    name: menu.name,
    names: certifiedLanguageMap(menu.names),
    description: menu.description,
    sort_order: Number(menu.sortOrder ?? 0) || 0,
    source_language: 'de',
    status: 'published',
    created: createdStamp(snap),
    updated: updatedStamp(),
  }
}

function writeMenuStructure(batch, menuRef, menu, kitchenId) {
  buildSections(menu.sections).forEach((section) => {
    const sectionRef = menuRef.collection('sections').doc(section.id)
    const { items, active, ...sectionPayload } = section

    batch.set(
      sectionRef,
      {
        ...sectionPayload,
        kitchen_id: kitchenId,
        menu_id: menu.id,
        status: active === false ? 'archived' : 'active',
        created: createdStamp(),
        updated: updatedStamp(),
      },
      { merge: false }
    )

    items.forEach((item) => {
      const { active: itemActive, ...itemPayload } = item
      batch.set(
        sectionRef.collection('items').doc(item.id),
        {
          ...itemPayload,
          ...(itemPayload.dish_id ? { dish_id: itemPayload.dish_id } : {}),
          kitchen_id: kitchenId,
          menu_id: menu.id,
          section_id: section.id,
          status: itemActive === false ? 'archived' : 'active',
          created: createdStamp(),
          updated: updatedStamp(),
        },
        { merge: false }
      )
    })
  })
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
  const englishDescription = normalizeString(ENGLISH_DESCRIPTIONS[item.id])
  const italianDescription = normalizeString(ITALIAN_DESCRIPTIONS[item.id])
  const italianName = normalizeString(ITALIAN_NAMES[item.id]) || name
  const descriptions = {
    ...existingDescriptions,
    ...(description ? { de: description } : {}),
    ...(englishDescription ? { en: englishDescription } : {}),
    ...(italianDescription ? { it: italianDescription } : {}),
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
      it: italianName,
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
      MENUS.flatMap((menu) => menu.sections.flatMap((section) => section.items))
        .filter((item) => !item.inline)
        .map((item) => [
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
        display_name: 'Luna Piccante',
        slug: 'luna-picante',
        show: false,
        primary_language: 'de',
        sproochli_enabled: true,
        menu_currency_format: 'dash',
        menu_show_currency: false,
        name: FieldValue.delete(),
        short_name: FieldValue.delete(),
        short_address: FieldValue.delete(),
        formatted_address: FieldValue.delete(),
        image_url: FieldValue.delete(),
        currency_code: FieldValue.delete(),
        currency_format: FieldValue.delete(),
        show_currency: FieldValue.delete(),
        style: FieldValue.delete(),
        opening_hours: FieldValue.delete(),
        public_menu_design: FieldValue.delete(),
        language_settings: {
          default_language: 'de',
          supported_languages: ['de', 'en', 'it', 'fr', 'ar'],
          attached_languages: ['de', 'en', 'it'],
          cache_languages: ['fr', 'ar'],
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
      writeMenuStructure(batch, snap.ref, menu, LUNA_KITCHEN_ID)
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
