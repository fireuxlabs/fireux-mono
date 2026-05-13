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
const FALLBACK_KITCHEN_ID = 'bergwelt-grindelwald'
const KITCHEN_SLUG = 'bergwelt-grindelwald'
const APP_ID = 'misebox-app'
const SYSTEM_ACTOR = 'system:seed-bergwelt-grindelwald-public-menus'
const SOURCE_PDF = '/Users/danielwatson/Downloads/Barkarte-BGs-FOOD-FRUEHLING-2026.pdf'

const normalizeString = (value) => String(value ?? '').trim()

function dish(input) {
  return input
}

const SECTIONS = [
  {
    id: 'food',
    label: 'BG’S BAR & SOUL FOOD',
    items: [
      dish({
        id: 'grindelwalder',
        name: 'Grindelwalder',
        description: 'Trockenfleisch | Käse | Pickels / dry meat | local cheese | pickles',
        price: 24,
      }),
      dish({
        id: 'beef-tatar-asia-style',
        name: 'Beef Tatar Asia Style',
        description: 'Rettich | Soja | Kroepoek / beer radish | soy | kroepoek',
        price: 34,
      }),
      dish({
        id: 'patatas-bravas',
        name: 'Patatas Bravas',
        description: 'Kartoffeln | Bravas | Alioli / potato | bravasauce | alioli',
        price: 18,
      }),
      dish({
        id: 'cesare-cardini',
        name: 'Cesare Cardini',
        description: 'Poulet Brust | Speck | Grana Padano / chicken breast | bacon | grana padano',
        price: 26,
      }),
      dish({
        id: 'fruehlings-salat',
        name: 'Frühlings Salat',
        description: 'Grüne Spargeln | Erdbeeren | Radieschen / leaf salad | strawberries | radish',
        price: 18,
      }),
      dish({
        id: 'spicy-meat-balls',
        name: 'Spicy Meat Balls',
        description: 'Sugo | Knusprige Zwiebeln | Peperoncini / sugo | crispy onions | peperoncini',
        price: 22,
      }),
      dish({
        id: 'crispy-shrimps',
        name: 'Crispy Shrimps',
        description: 'Ponzu | Sweet Chili | Lemon Mayo / ponzu | sweet chili | lemon mayo',
        price: 26,
      }),
      dish({
        id: 'b-cheese-burger-royale',
        name: 'B’ Cheese-Burger Royale',
        description: 'Jungfrau Käse | Speck | BG’s Sauce / jungfrau cheese | bacon | bg’s sauce',
        price: 34,
      }),
      dish({
        id: 'tungs-thai-rolls',
        name: 'Tung’s Thai Rolls',
        description: 'Ponzu | Sweet Chili | Nam Satay / ponzu | sweet chili | nam satay',
        price: 28,
      }),
      dish({
        id: 'croque-monsieur',
        name: 'Croque Monsieur',
        description: 'Toast | Schinken | Greyerzer / toast | ham | gruyère cheese',
        price: 22,
      }),
      dish({
        id: 'miso-ramen',
        name: 'Miso Ramen',
        description: 'Pak Choi | Onsen Ei | Poulet Brust / pak choi | onsen egg | chicken',
        price: 26,
      }),
      dish({
        id: 'casarecce',
        name: 'Casarecce',
        description: 'Pomodoro | Bolognese | Aglio & Olio / pomodoro | bolognese | aglio & olio',
        price: 28,
      }),
    ],
  },
  {
    id: 'dessert',
    label: 'DESSERT | SWEET’s',
    items: [
      dish({
        id: 'glace-sorbet',
        name: 'Glace & Sorbet',
        description: [
          'mit Rahm | with chantilly +5',
          'Glace: Vanille | Schokolade | Caramell | Joghurt | Kaffee',
          'ice cream: vanilla | chocolate | caramel | yogurt | coffee',
          'Sorbet: Zitrone | Erdbeer | Himbeer | Passionsfrucht | Mango',
          'sorbet: lemon | strawberry | raspberry | passion fruit | mango',
        ].join('\n'),
        price: 6,
      }),
      dish({
        id: 'coupe-colonel',
        name: 'Coupe Colonel',
        description: 'Wodka | Zitronen Sorbet | Basilikum / vodka | lemon sorbet | basil',
        price: 18,
      }),
      dish({
        id: 'savarin-au-rhum',
        name: 'Savarin au Rhum',
        description: 'Hefekuchen | Tee | Bumbu Rum / yeast cake | tea | bumbu rum',
        price: 20,
      }),
      dish({
        id: 'eiger-milch-jumi-kaese',
        name: 'Eiger Milch & Jumi Käse',
        description: [
          'Bergsteiger | La Sanglé | Trüffel La Bouse | Summerhimu | Crème Chèvre',
          'Früchtebrot | Trauben | Feigensenf',
          'Assorted selection of local cheese',
        ].join('\n'),
        price: 24,
      }),
    ],
  },
  {
    id: 'information',
    label: 'Allergien / Intoleranzen',
    items: [
      dish({
        id: 'allergien-intoleranzen',
        name: 'Allergien / Intoleranzen',
        description: [
          'Bitte informieren Sie uns über allfällige Allergien oder Intoleranzen.',
          'Bitte beachten Sie: Bei uns kommt alles aus einer Küche. Kreuzkontaminationen können daher nicht zu 100% ausgeschlossen werden.',
          'Unser Service Team wird Sie gerne beraten.',
          'Please inform us about any allergies or intolerances.',
          'Please be advised that all products are prepared in the same kitchen. We cannot guarantee that cross-contamination will be prevented.',
          'Our service team will be happy to advise you.',
        ].join('\n'),
      }),
      dish({
        id: 'brot-herkunft',
        name: 'Brot',
        description: [
          'Brot beziehen wir ausschliesslich aus der Schweiz und stets so lokal wie möglich.',
          'We source our bread exclusively from Switzerland and always as locally as possible.',
        ].join('\n'),
      }),
    ],
  },
  {
    id: 'declaration',
    label: 'Deklaration & Herkunft',
    items: [
      dish({
        id: 'deklaration-herkunft',
        name: 'Deklaration & Herkunft',
        description: [
          'Kalb / Veal: Schweiz / Switzerland',
          'Pouletbrust / Chicken breast: Schweiz / Switzerland',
          'Rindstatar / Beef tatar: Schweiz / Switzerland',
          'Fleischerzeugnisse / Meat products: Schweiz / Switzerland',
          'Shrimps: Vietnam',
        ].join('\n'),
      }),
    ],
  },
]

const MENU = {
  id: 'main',
  name: 'BG’S BAR & SOUL FOOD',
  description: 'Bergwelt Grindelwald',
  sections: SECTIONS,
}

const UNCLEAR_ITEMS = [
  'Beef Tatar Asia Style: PDF parse looked like “Re! ich”; seeded as “Rettich”.',
  'Frühlings Salat: PDF parse had likely spelling noise around “Spargeln” and “Radieschen”; seeded cleanly.',
  'Information/declaration rows are seeded as non-priced menu rows for now.',
  'Google Place enrichment was not used in this fast seed; stable fallback kitchen id is used if no slug match exists.',
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
Seed Bergwelt Grindelwald public menu.

Dry-run by default. Pass --commit to write.

Usage:
  node scripts/seed-bergwelt-grindelwald-public-menus.mjs [--commit] [--reset]

Options:
  --commit                         Write Firestore docs.
  --reset                          Delete Bergwelt menus/dishes/cache before reseeding.
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

function buildSections(sections) {
  return sections.map((section, sectionIndex) => ({
    id: section.id,
    label: section.label,
    description: '',
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
    active: true,
    defaults: {
      active: true,
      description: '',
      photo_url: '',
    },
    service_modes: ['dine_in'],
    sections: buildSections(menu.sections),
    dish_ids: menu.sections.flatMap((section) => section.items.map((item) => item.id)),
    sort_order: 10,
    created: createdStamp(snap),
    updated: updatedStamp(),
  }
}

function buildDishPayload(item, kitchenId, snap) {
  return {
    id: item.id,
    kitchen_id: kitchenId,
    name: item.name,
    slug: item.id,
    description: normalizeString(item.description),
    names: {},
    descriptions: {},
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
    'seed-bergwelt-grindelwald-public-menus'
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
  const effectiveMenuSnap = reset ? undefined : menuSnap
  const effectiveDishSnaps = reset ? [] : dishSnaps
  const planned = {
    kitchen: kitchenSnap.exists ? 'update' : 'create',
    kitchenIdSource: slugSnap.empty ? 'fallback-id' : 'existing-slug-match',
    placeEnrichment: 'pending',
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

  logSeed('[seed] bergwelt-grindelwald-public-menus start', {
    commit,
    reset,
    projectId,
    databaseId,
    serviceAccount: resolvedServiceAccountPath,
    sourcePdf: SOURCE_PDF,
    sourcePdfFound: existsSync(SOURCE_PDF),
    kitchenPath: kitchenRef.path,
    kitchenId,
    kitchenIdSource: planned.kitchenIdSource,
    placeEnrichment: planned.placeEnrichment,
    menuIds: [MENU.id],
    sectionCount: MENU.sections.length,
    dishCount: dishEntries.length,
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
        name: 'Bergwelt Grindelwald',
        display_name: 'Bergwelt Grindelwald',
        slug: KITCHEN_SLUG,
        show: false,
        description: 'BG’S BAR & SOUL FOOD',
        primary_language: 'de',
        currency_code: 'CHF',
        currency_format: 'dash',
        design: {
          color_mode: 'light',
        },
        public_menu_design: FieldValue.delete(),
        language_settings: {
          default_language: 'de',
          supported_languages: [],
          public_languages: FieldValue.delete(),
          attached_languages: [],
          cache_languages: [],
        },
        supported_languages: [],
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

    await batch.commit()
  }

  logSeed('[seed] bergwelt-grindelwald-public-menus done', {
    commit,
    reset,
    routes: [
      '/kitchens/bergwelt-grindelwald/menus',
      '/kitchens/bergwelt-grindelwald/menus/main',
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
        }
      : {
          kitchen: 0,
          menus: 0,
          dishes: 0,
          deleted: { menus: 0, dishes: 0, translation_cache: 0 },
        },
    resetPlan,
    planned,
    unclearItems: UNCLEAR_ITEMS,
  })
}

main().catch((error) => {
  console.error('[seed] bergwelt-grindelwald-public-menus failed')
  console.error(error)
  process.exitCode = 1
})
