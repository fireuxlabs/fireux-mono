#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { isAbsolute, join, resolve } from 'node:path'
import { parseArgs } from './_lib/args.mjs'
import {
  LA_TAPBERNE_ATTACHED_LANGUAGES,
  LA_TAPBERNE_CACHE_LANGUAGES,
  LA_TAPBERNE_TRANSLATIONS,
} from './seed-la-tapberne-translation-cache.mjs'

const DEFAULT_PROJECT_ID = 'misebox-78f9c'
const DEFAULT_SERVICE_ACCOUNT_PATH =
  'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json'
const DEFAULT_DATABASE_ID = 'misebox'
const DEFAULT_KITCHEN_COLLECTION_PATH = 'kitchens'
const FALLBACK_KITCHEN_ID = 'la-tapberne'
const KITCHEN_SLUG = 'la-tapberne'
const APP_ID = 'misebox-app'
const SYSTEM_ACTOR = 'system:seed-la-tapberne-public-menus'
const ATTACHED_LANGUAGES = LA_TAPBERNE_ATTACHED_LANGUAGES
const CACHE_LANGUAGES = [...new Set([...LA_TAPBERNE_CACHE_LANGUAGES, 'bo'])]
const PUBLIC_LANGUAGES = [...new Set([...ATTACHED_LANGUAGES, ...CACHE_LANGUAGES])]

const normalizeString = (value) => String(value ?? '').trim()

function dish(input) {
  return input
}

const SECTIONS = [
  {
    id: 'las-tapas',
    label: 'Las Tapas',
    labels: {
      de: 'Las Tapas',
      en: 'Tapas',
    },
    items: [
      dish({
        id: 'aioli',
        name: 'Aioli',
        deDescription: 'Knoblauch-Mayonnaise',
        enDescription: 'Garlic mayonnaise',
        price: 9.5,
      }),
      dish({
        id: 'bravas',
        name: 'Bravas',
        deDescription: 'Scharfe Sauce',
        enDescription: 'Spicy sauce',
        price: 9.5,
      }),
      dish({
        id: 'tortilla-de-patata',
        name: 'Tortilla de Patata',
        deDescription: 'Die spanische Kartoffel-Omelette. Ø24cm. Klein 9.50, mittel 16.-, gross 25.-',
        enDescription: 'The Spanish potato omelette. Ø24cm. Small 9.50, medium 16.-, large 25.-',
      }),
      dish({
        id: 'gebratene-pimientos-de-padron',
        name: 'Gebratene Pimientos de Padrón',
        enName: 'Fried Pimientos de Padrón',
        deDescription: 'mit Meersalzflocken',
        enDescription: 'Fried Padrón peppers with sea salt flakes',
        price: 9,
      }),
      dish({
        id: 'portobello-al-ajillo',
        name: 'Portobello al Ajillo',
        deDescription: 'Portobello-Pilze in Knoblauch-Chili-Öl',
        enDescription: 'Portobello mushrooms in garlic chili oil',
        price: 16,
      }),
      dish({
        id: 'panierte-camembert',
        name: 'Panierte Camembert',
        enName: 'Breaded Camembert',
        deDescription: 'und Tomatenmarmelade',
        enDescription: 'and tomato jam',
        price: 16,
      }),
      dish({
        id: 'buffalo-schwein-ribs',
        name: 'Buffalo-Schwein Ribs',
        enName: 'Buffalo Pork Ribs',
        deDescription: 'mit scharfer Sauce. Mit Pommes 27.-',
        enDescription: 'Buffalo spicy pork ribs. With fries 27.-',
        price: 23,
      }),
      dish({
        id: 'the-famous-schweinebauch-albarino-teriyaki',
        name: '"The Famous" Schweinebauch Albariño Teriyaki',
        enName: '"The Famous" Pork Belly Albariño Teriyaki',
        deDescription: 'Wakame-Salat, Cipollotte und Sesam. Mit Pommes 25.-',
        enDescription: 'Teriyaki-glazed pork belly, wakame salad, spring onions and sesame. With fries 25.-',
        price: 21,
      }),
      dish({
        id: 'crispy-chicken-fingers',
        name: 'Crispy Chicken Fingers',
        deDescription: '5 selbstgemachte knusprige Poulet Fingers, scharfe Pickles, Guacamole und Aioli Sauce. Mit Pommes 25.-',
        enDescription: '5 homemade crispy chicken fingers with spicy pickles, guacamole and aioli sauce. With fries 25.-',
        price: 21,
      }),
    ],
  },
  {
    id: 'ein-bisschen-meer',
    label: '... ein bisschen "Meer"',
    labels: {
      de: 'Ein bisschen Meer',
      en: 'A little bit of the sea',
    },
    items: [
      dish({
        id: 'black-tiger-al-ajillo',
        name: 'Black Tiger al Ajillo',
        deDescription: 'Garnelen in Knoblauch-Chili-Öl',
        enDescription: 'Shrimps in garlic chili oil',
        price: 18,
      }),
      dish({
        id: 'calamares-knusperli',
        name: 'Calamares Knusperli',
        deDescription: 'mit Aioli und gegrillter Zitrone',
        enDescription: 'Beer-battered calamari with aioli and grilled lemon',
        price: 18,
      }),
      dish({
        id: 'pulpo-a-la-gallega',
        name: 'Pulpo a la Gallega',
        deDescription: 'Tintenfisch nach galizischer Art mit Olivenöl, geräuchertem Paprikapulver und Kartoffeln "cachelos"',
        enDescription: 'Galician-style octopus with olive oil, smoked paprika and "cachelos" potatoes',
        price: 25,
      }),
      dish({
        id: 'gegrillter-pulpo',
        name: 'Gegrillter Pulpo',
        enName: 'Grilled Pulpo',
        deDescription: 'Chimichurri und Hummus pikant',
        enDescription: 'Chimichurri and spicy hummus',
        price: 25,
      }),
    ],
  },
  {
    id: 'kroketten',
    label: 'Kroketten',
    labels: {
      de: 'Kroketten',
      en: 'Croquettes',
    },
    items: [
      dish({
        id: 'jamon-kroketten',
        name: 'Jamón',
        deDescription: 'Serrano Schinken',
        enDescription: 'Serrano ham',
        price: 10,
      }),
      dish({
        id: 'trueffel-kroketten',
        name: 'Trüffel',
        enName: 'Truffle',
        deDescription: 'Champignons und Trüffelöl',
        enDescription: 'Mushrooms and truffle oil',
        price: 10,
      }),
    ],
  },
  {
    id: 'salats',
    label: 'Salats',
    labels: {
      de: 'Salate',
      en: 'Salads',
    },
    items: [
      dish({
        id: 'gemischter-salat',
        name: 'Gemischter Salat',
        enName: 'Mixed Salad',
        deDescription: 'mit La Tapberne Salatsauce',
        enDescription: 'mixed salad with La Tapberne salad dressing',
        price: 10,
      }),
      dish({
        id: 'bloody-mary-burrata',
        name: 'Bloody Mary Burrata',
        deDescription: 'Tomaten, Sellerie, rote Zwiebeln und Bloody Mary Sauce',
        enDescription: 'tomatoes, celery, red onions and Bloody Mary sauce',
        price: 19,
      }),
      dish({
        id: 'tapberne-nuessler-salat',
        name: 'Tapberne Nüssler Salat',
        enName: 'Tapberne Lamb’s Lettuce Salad',
        deDescription: 'Schweinebauch, Ei, geröstetes Brot und Sauce',
        enDescription: 'pork belly, egg, toasted bread and dressing',
        price: 21,
      }),
      dish({
        id: 'caesar-crispy-poulet-salat',
        name: 'Caesar Crispy Poulet Salat',
        enName: 'Caesar Crispy Chicken Salad',
        deDescription: 'Speck, Manchego Käse und Caesar Dressing',
        enDescription: 'lettuce, bacon, chicken, Manchego cheese and Caesar dressing',
        price: 21,
      }),
    ],
  },
  {
    id: 'hauptgerichte',
    label: 'Hauptgerichte',
    labels: {
      de: 'Hauptgerichte',
      en: 'Main dishes',
    },
    items: [
      dish({
        id: 'zorza-schwein-poulet',
        name: 'Zorza Schwein/Poulet',
        enName: 'Zorza Pork/Chicken',
        deDescription: 'Marinierte Streifen auf Pommes allumettes und geröstete Paprika. Add-ons: Manchego 2.50, Spiegelei 2.50',
        enDescription: 'Marinated pork or chicken strips on shoestring fries and roasted pepper. Add-ons: Manchego 2.50, fried egg 2.50',
        price: 27,
      }),
      dish({
        id: 'huevos-rotos-con-cecina',
        name: 'Huevos Rotos con Cecina',
        deDescription: 'Cecina Schinken, 2 Spiegeleier und Rustico Frites. Add-ons: Manchego 2.50, Trüffelöl 2.50',
        enDescription: 'Cecina ham, 2 fried eggs and Rustico fries. Add-ons: Manchego 2.50, truffle oil 2.50',
        price: 24,
      }),
      dish({
        id: 'fish-and-chips',
        name: 'Fish and Chips',
        deDescription: 'Im Bierteig knusprig ausgebackene Eglifilets, frische Tartarsauce, hausgemachte Pickles und Pommes',
        enDescription: 'Crispy perch fillets in beer batter, fresh tartar sauce, homemade pickles and fries',
        price: 27,
      }),
    ],
  },
  {
    id: 'chefs-special',
    label: 'Chef’s Special',
    labels: {
      de: 'Chef’s Special',
      en: 'Chef’s Special',
    },
    items: [
      dish({
        id: 'el-cachopo',
        name: 'El Cachopo',
        deDescription: 'Rinds asturischer "Cordon Bleu", selbstgemacht, gefüllt mit Cecina und Manchego Käse, begleitet mit unseren Patatas und Pimientos de Padrón',
        enDescription: 'Asturian beef "Cordon Bleu", filled with Cecina and Manchego cheese, accompanied with our patatas and Pimientos de Padrón',
        price: 38,
      }),
    ],
  },
  {
    id: 'onlyhands',
    label: '"Onlyhands"',
    labels: {
      de: '"Onlyhands"',
      en: '"Onlyhands"',
    },
    items: [
      dish({
        id: 'picanha-smashburger',
        name: 'Picanha Smashburger',
        deDescription: 'Zwei selbstgemachte Rinds-Hüftdeckel Patties, doppeltem Käse, Romesco Sauce, Nüsslisalat, Röstzwiebeln, Brioche Brot dazu Rustico Frites',
        enDescription: 'Two homemade beef rump patties, double cheese, Romesco sauce, lamb’s lettuce, fried onion, brioche bread and rustic fries',
        price: 28,
      }),
      dish({
        id: 'the-vegi-smashburger',
        name: 'The Vegi Smashburger',
        price: 25,
      }),
      dish({
        id: 'la-tapberne-francesinha-pulled-beef-sandwich',
        name: 'La Tapberne Francesinha Pulled Beef Sandwich',
        deDescription: 'Toastbrot, Pulled Beef, Cecina, Käse überbacken, Spiegelei und "Francesinha" Sauce, dazu Pommes',
        enDescription: 'Toast bread, pulled beef, cecina ham, baked cheese, fried egg and sauce, with fries',
        price: 28,
      }),
      dish({
        id: 'hot-dog',
        name: 'Hot Dog',
        deDescription: 'Zwei Käsesorten, Tomatenmarmelade, Senf, rote Zwiebel-Pickles und Schweinebauch Chips "Torreznos", dazu Pommes',
        enDescription: 'Two types of cheese, tomato jam, mustard, red onion pickles and pork belly chips "Torreznos", served with fries',
        price: 18,
      }),
      dish({
        id: 'hot-dog-vegi',
        name: 'Hot Dog Vegi',
        price: 18,
      }),
      dish({
        id: 'egli-sandwich',
        name: 'Egli Sandwich',
        deDescription: 'Einfach und lecker, Egli Knusperli auf einem Ciabatta Brot mit Tartarsauce und Salat',
        enDescription: 'Simple and delicious crispy perch on a ciabatta bread with tartar sauce and salad',
        price: 17,
      }),
      dish({
        id: 'serrano-sandwich',
        name: 'Serrano Sandwich',
        deDescription: 'mit Jamón Serrano, Burrata, Tomate und Ciabatta Brot',
        enDescription: 'with Jamón Serrano, burrata, tomato and ciabatta bread',
        price: 16,
      }),
    ],
  },
  {
    id: 'dessert',
    label: 'Öppis süss!',
    labels: {
      de: 'Öppis Süsses',
      en: 'Something sweet',
    },
    items: [
      dish({
        id: 'churro-bites',
        name: 'Churro Bites',
        deDescription: 'Kleine Churro-Snacks mit Zimtzucker und Schokoladensauce',
        enDescription: 'Small churro snacks with cinnamon sugar and chocolate sauce',
        price: 10,
      }),
      dish({
        id: 'cheesecake',
        name: 'Cheesecake',
        deDescription: 'Kalt und mit hausgemachter Konfitüre',
        enDescription: 'Cold and with homemade jam',
        price: 10,
      }),
      dish({
        id: 'happy-tarta-de-santiago',
        name: 'Happy Tarta de Santiago',
        deDescription: 'Der spanische Mandelkuchen mit Rahm-Rum-Rosinen-Eis',
        enDescription: 'The Spanish almond cake with cream, rum and raisin ice cream',
        price: 10,
      }),
    ],
  },
]

const MENU = {
  id: 'main',
  name: 'Comida Casera',
  names: {
    de: 'Comida Casera',
    en: 'Comida Casera',
  },
  description: '',
  descriptions: {
    de: 'Tapas-Gastro-Pub · Hausgemachte Küche',
    en: 'Tapas-Gastro-Pub · Homemade food',
  },
  note: 'Alle Preise in CHF inkl. MwSt.',
  notes: {
    de: 'Alle Preise in CHF inkl. MwSt.',
    en: 'All prices in CHF incl. VAT.',
  },
  sections: SECTIONS,
}

const UNCLEAR_ITEMS = []

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
Seed La Tapberne public menu.

Dry-run by default. Pass --commit to write.

Usage:
  node scripts/seed-la-tapberne-public-menus.mjs [--commit] [--reset]

Options:
  --commit                         Write Firestore docs.
  --reset                          Delete La Tapberne menus/dishes/cache before reseeding.
  --project <id>                   Firebase project id.
  --database <id>                  Firestore database id. Defaults to misebox.
  --service-account <path>         Service account JSON path.
  --kitchen-collection <path>      Kitchen collection path. Defaults to kitchens.
`)
}

function logSeed(label, payload) {
  console.log(label, JSON.stringify(payload, null, 2))
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

function languageMap(input, keys) {
  return Object.fromEntries(
    keys.map(([language, key, fallback]) => [
      language,
      normalizeString(input?.[key] ?? fallback ?? ''),
    ])
  )
}

function itemNames(item) {
  return {
    ...languageMap(item, [
    ['de', 'deName', item.name],
    ['en', 'enName', item.name],
    ]),
    es: normalizeString(LA_TAPBERNE_TRANSLATIONS.es?.dishes?.[item.id]?.name ?? item.name),
    pt: normalizeString(LA_TAPBERNE_TRANSLATIONS.pt?.dishes?.[item.id]?.name ?? item.name),
  }
}

function itemDescriptions(item) {
  return {
    ...languageMap(item, [
    ['de', 'deDescription', ''],
    ['en', 'enDescription', ''],
    ]),
    es: normalizeString(LA_TAPBERNE_TRANSLATIONS.es?.dishes?.[item.id]?.description ?? ''),
    pt: normalizeString(LA_TAPBERNE_TRANSLATIONS.pt?.dishes?.[item.id]?.description ?? ''),
  }
}

function buildSections(sections) {
  return sections.map((section, sectionIndex) => ({
    id: section.id,
    label: section.label,
    labels: {
      de: normalizeString(section.labels?.de ?? section.label),
      en: normalizeString(section.labels?.en ?? section.label),
      es: normalizeString(LA_TAPBERNE_TRANSLATIONS.es?.sections?.[section.id] ?? section.label),
      pt: normalizeString(LA_TAPBERNE_TRANSLATIONS.pt?.sections?.[section.id] ?? section.label),
    },
    description: '',
    descriptions: {
      de: normalizeString(section.descriptions?.de ?? ''),
      en: normalizeString(section.descriptions?.en ?? ''),
      es: '',
      pt: '',
    },
    sort_order: sectionIndex + 1,
    items: section.items.map((item, itemIndex) => ({
      id: `${section.id}-${String(itemIndex + 1).padStart(2, '0')}`,
      dish_id: item.id,
      label: '',
      description: '',
      price: Number(item.price ?? 0) || 0,
      sort_order: itemIndex + 1,
      active: true,
    })),
  }))
}

function buildMenuPayload(menu, kitchenId, snap) {
  return {
    id: menu.id,
    kitchen_id: kitchenId,
    name: menu.name,
    description: menu.description,
    status: 'published',
    source_language: 'de',
    created: createdStamp(snap),
    updated: updatedStamp(),
  }
}

function writeMenuStructure(batch, menuRef, menu, kitchenId) {
  buildSections(menu.sections).forEach((section) => {
    const sectionRef = menuRef.collection('sections').doc(section.id)
    const sectionCreated = createdStamp()
    const { items, labels, descriptions, active, ...sectionPayload } = section

    batch.set(
      sectionRef,
      {
        ...sectionPayload,
        kitchen_id: kitchenId,
        menu_id: menu.id,
        status: active === false ? 'archived' : 'active',
        created: sectionCreated,
        updated: updatedStamp(),
      },
      { merge: false }
    )

    items.forEach((item) => {
      const { active: itemActive, label, description, ...itemPayload } = item
      batch.set(
        sectionRef.collection('items').doc(item.id),
        {
          ...itemPayload,
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
  return {
    id: item.id,
    kitchen_id: kitchenId,
    name: item.name,
    slug: item.id,
    description: '',
    names: itemNames(item),
    descriptions: itemDescriptions(item),
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
  const reset = Boolean(args.reset)
  const app = initializeApp(
    { credential: cert(account), projectId },
    'seed-la-tapberne-public-menus'
  )
  const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app)
  const kitchensRef = db.collection(kitchenCollectionPath)
  const slugSnap = await kitchensRef.where('slug', '==', KITCHEN_SLUG).limit(1).get()
  const kitchenRef = slugSnap.empty
    ? db.doc(`${kitchenCollectionPath}/${FALLBACK_KITCHEN_ID}`)
    : slugSnap.docs[0].ref
  const kitchenId = kitchenRef.id
  const dishEntries = MENU.sections.flatMap((section) => section.items)
  const [kitchenSnap, existingMenusSnap, existingDishesSnap, menuSnap, ...dishSnaps] = await Promise.all([
    kitchenRef.get(),
    kitchenRef.collection('menus').get(),
    kitchenRef.collection('dishes').get(),
    kitchenRef.collection('menus').doc(MENU.id).get(),
    ...dishEntries.map((item) => kitchenRef.collection('dishes').doc(item.id).get()),
  ])
  const translationCacheSnaps = await Promise.all(
    existingMenusSnap.docs.map((snap) => snap.ref.collection('translation_cache').get())
  )
  const resetPlan = {
    menus: existingMenusSnap.size,
    dishes: existingDishesSnap.size,
    translation_cache: translationCacheSnaps.reduce((count, snap) => count + snap.size, 0),
  }
  const existingLanguageSettings = kitchenSnap.exists
    && kitchenSnap.data()?.language_settings
    && typeof kitchenSnap.data()?.language_settings === 'object'
    && !Array.isArray(kitchenSnap.data()?.language_settings)
    ? kitchenSnap.data().language_settings
    : {}
  const preservedCacheLanguages = reset
    ? CACHE_LANGUAGES
    : [
        ...new Set([
          ...(Array.isArray(existingLanguageSettings.cache_languages)
            ? existingLanguageSettings.cache_languages
            : []),
          ...CACHE_LANGUAGES,
        ]),
      ]
  const effectiveMenuSnap = reset ? undefined : menuSnap
  const effectiveDishSnaps = reset ? [] : dishSnaps
  const planned = {
    kitchen: kitchenSnap.exists ? 'update' : 'create',
    menus: {
      create: reset || !menuSnap.exists ? [MENU.id] : [],
      update: !reset && menuSnap.exists ? [MENU.id] : [],
    },
    dishes: {
      create: dishEntries
        .filter((_, index) => reset || !dishSnaps[index]?.exists)
        .map((item) => item.id),
      update: dishEntries
        .filter((_, index) => !reset && dishSnaps[index]?.exists)
        .map((item) => item.id),
    },
  }

  logSeed('[seed] la-tapberne-public-menus start', {
    commit,
    reset,
    projectId,
    databaseId,
    serviceAccount: resolvedServiceAccountPath,
    kitchenPath: kitchenRef.path,
    kitchenId,
    kitchenIdSource: slugSnap.empty ? 'fallback-id' : 'existing-slug-match',
    menuIds: [MENU.id],
    sectionCount: MENU.sections.length,
    dishCount: dishEntries.length,
    attachedLanguages: ATTACHED_LANGUAGES,
    resetPlan,
    unclearItems: UNCLEAR_ITEMS,
    planned,
  })

  if (commit) {
    if (reset) {
      const resetBatch = db.batch()
      translationCacheSnaps.forEach((snap) => {
        snap.docs.forEach((doc) => resetBatch.delete(doc.ref))
      })
      existingMenusSnap.docs.forEach((doc) => resetBatch.delete(doc.ref))
      existingDishesSnap.docs.forEach((doc) => resetBatch.delete(doc.ref))
      if (resetPlan.menus || resetPlan.dishes || resetPlan.translation_cache) {
        await resetBatch.commit()
      }
    }

    const batch = db.batch()
    batch.set(
      kitchenRef,
      {
        id: kitchenId,
        display_name: 'La Tapberne',
        slug: KITCHEN_SLUG,
        show: true,
        type: 'Tapas-Gastro-Pub',
        description: 'Tapas-Gastro-Pub · Comida Casera',
        address: 'Herrenackerstrasse 49, 3800 Matten bei Interlaken',
        primary_language: 'de',
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
          supported_languages: PUBLIC_LANGUAGES,
          public_languages: PUBLIC_LANGUAGES,
          attached_languages: ATTACHED_LANGUAGES,
          sproochli: true,
          cache_languages: preservedCacheLanguages,
        },
        supported_languages: PUBLIC_LANGUAGES,
        active: true,
        updated: updatedStamp(),
        created: createdStamp(kitchenSnap),
      },
      { merge: true }
    )

    dishEntries.forEach((item, index) => {
      const snap = dishSnaps[index]
      batch.set(snap.ref, buildDishPayload(item, kitchenId, effectiveDishSnaps[index]), { merge: false })
    })

    batch.set(
      menuSnap.ref,
      buildMenuPayload(MENU, kitchenId, effectiveMenuSnap),
      { merge: false }
    )
    writeMenuStructure(batch, menuSnap.ref, MENU, kitchenId)

    await batch.commit()
  }

  logSeed('[seed] la-tapberne-public-menus done', {
    commit,
    reset,
    routes: [
      '/kitchens/la-tapberne/menus',
      '/kitchens/la-tapberne/menus/main',
    ],
    paths: {
      kitchen: kitchenRef.path,
      dishes: kitchenRef.collection('dishes').path,
      menus: kitchenRef.collection('menus').path,
    },
    written: commit
      ? {
          kitchen: 1,
          menus: 1,
          dishes: dishEntries.length,
          deleted: reset ? resetPlan : { menus: 0, dishes: 0, translation_cache: 0 },
          attachedLanguages: ATTACHED_LANGUAGES,
        }
      : {
          kitchen: 0,
          menus: 0,
          dishes: 0,
          deleted: { menus: 0, dishes: 0, translation_cache: 0 },
          attachedLanguages: [],
        },
    resetPlan,
    planned,
    unclearItems: UNCLEAR_ITEMS,
  })
}

main().catch((error) => {
  console.error('[seed] la-tapberne-public-menus failed')
  console.error(error)
  process.exitCode = 1
})
