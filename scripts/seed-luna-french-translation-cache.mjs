#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { isAbsolute, join, resolve } from 'node:path'
import { parseArgs } from './_lib/args.mjs'

const DEFAULT_PROJECT_ID = 'misebox-78f9c'
const DEFAULT_SERVICE_ACCOUNT_PATH =
  'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json'
const DEFAULT_DATABASE_ID = 'misebox'
const LUNA_KITCHEN_ID = 'ChIJ93_ggY-jj0cRTCyLcfBuK2w'
const APP_ID = 'misebox-app'
const SYSTEM_ACTOR = 'system:seed-luna-french-translation-cache'
const DOMAIN = 'restaurant_menu'
const GLOSSARY_VERSION = 'restaurant_menu_v1'
const TARGET_LANGUAGE = 'fr'
const MENU_IDS = ['main', 'pizza']

const normalizeString = (value) => String(value ?? '').trim()

const FRENCH_MENU_NAMES = {
  main: 'Menu principal',
  pizza: 'Pizza',
}

const FRENCH_SECTION_LABELS = {
  main: {
    antipasti: 'Entrées',
    zuppa: 'Soupes',
    insalate: 'Salades',
    risotto: 'Risotto',
    gratinato: 'Gratiné',
    'kinder-karte': 'Menu enfant',
    pasta: 'Pâtes',
    pesce: 'Poisson',
    carne: 'Viande',
    'heisser-stein': 'Pierre chaude',
    contorni: 'Accompagnements',
  },
  pizza: {
    poulet: 'Poulet',
    rindsfleisch: 'Bœuf',
    'fisch-meeresfruchte': 'Poisson & fruits de mer',
    lammfleisch: 'Agneau',
    kalbsfleisch: 'Veau',
    'vegetarisch-vegan': 'Végétarien & végan',
    schweinefleisch: 'Porc',
  },
}

const FRENCH_INLINE_ITEMS = {
  main: {
    'contorni-01': {
      label: 'Accompagnements',
      description: 'Spaghetti, penne, frites, riz, risotto ou salade',
    },
    'contorni-02': {
      label: 'Supplément accompagnements',
      description: '+3.- risotto au safran, pâtes maison, pâtes sans gluten',
    },
    'contorni-03': {
      label: 'Accompagnement supplémentaire',
      description: '+6.- par accompagnement supplémentaire',
    },
  },
}

const FRENCH_DISH_DESCRIPTIONS = {
  'focaccia-aperitivo-pomodoro-bufala-e-parma':
    'Pâte à pizza à l’huile d’olive et à l’ail avec dés de tomates assaisonnés, mozzarella di bufala et jambon de Parme',
  'focaccia-prosciutto-di-parma':
    'Pâte à pizza à l’huile d’olive et à l’ail avec jambon de Parme',
  'carpaccio-di-manzo':
    'Carpaccio de bœuf avec Grana Padano, huile d’olive et jus de citron, garni de roquette',
  'gamberetti-all-aglio':
    'Gambas chaudes à l’huile d’olive et à l’ail, servies sur roquette avec tranches de pain grillé',
  'cocktail-di-gamberetti':
    'Crevettes à la sauce cocktail maison, servies avec tranches de pain grillé',
  bruschetta:
    'Dés de tomates assaisonnés aux herbes fraîches, oignons, ail, basilic et huile d’olive, servis sur pain maison grillé',
  minestrone:
    'Soupe italienne de légumes',
  'crema-di-pomodoro':
    'Velouté de tomates',
  'insalata-soncino':
    'Rampon avec lard, œuf et croûtons',
  'insalata-caprese':
    'Salade de tomates avec mozzarella di bufala, basilic, huile d’olive et vinaigre',
  burrata:
    'Spécialité crémeuse de fromage frais des Pouilles, sur tomates et basilic à l’huile d’olive',
  'insalata-gigante':
    'Grande assiette de salade composée avec œuf',
  'insalata-verde':
    'Salade verte',
  'insalata-mista':
    'Salade mêlée',
  'risotto-milanese':
    'Risotto au safran avec oignons et ail',
  'risotto-pollo-e-zafferano':
    'Risotto avec émincé de poulet, oignons, ail, sauce au safran et Grana Padano',
  'risotto-porcini':
    'Risotto au Grana Padano avec cèpes, ail et oignons',
  'gnocchi-piemontese':
    'Gnocchi aux cèpes, oignons et ail, sauce Marsala et crème, gratinés au Grana Padano et à la mozzarella',
  'lasagna-casalinga':
    'Lasagne maison farcie au bœuf, gratinée au Grana Padano et à la mozzarella',
  'cannelloni-fiorentina':
    'Cannelloni maison farcis aux épinards et au séré, sauce tomate, gratinés au Grana Padano et à la mozzarella',
  'spaghetti-with-tomato-sauce':
    'Spaghetti à la sauce tomate',
  'kids-spaghetti-bolognese':
    'Spaghetti bolognaise',
  'kids-spaghetti-carbonara':
    'Spaghetti carbonara',
  'kids-spaghetti-al-pesto':
    'Spaghetti au pesto',
  'spaghetti-al-burro':
    'Spaghetti au beurre',
  'gnocchi-al-burro':
    'Gnocchi au beurre',
  capitano:
    'Bâtonnets de poisson frits avec frites',
  'chicken-nuggets':
    'Avec frites',
  'portion-pommes-frites':
    'Frites',
  'risotto-bambini':
    'Risotto au Grana Padano',
  'paglia-e-fieno-bella-rebecca':
    'Pâtes bicolores avec émincé de veau, champignons des bois, oignons et ail à la sauce crème',
  'fettuccine-nere-mare-e-monti':
    'Pâtes noires avec crevettes, cèpes, oignons et ail à la sauce crème',
  'fettuccine-nere-al-salmone':
    'Pâtes noires avec saumon, oignons, ail et herbes fraîches à la sauce tomate-crème maison',
  'penne-all-arrabbiata':
    'Penne avec lard, piments, oignons et ail à la sauce tomate maison',
  'penne-imperiale':
    'Penne avec crevettes, dés de tomates, oignons, ail et herbes fraîches à la sauce tomate-crème maison',
  'penne-alla-fiamma':
    'Penne avec dés de bœuf flambés, poivrons, oignons, ail, tomates fraîches, champignons, herbes fraîches et sauce crème au paprika',
  'spaghetti-aglio-olio-e-peperoncino':
    'Spaghetti à l’ail, à l’huile d’olive et aux piments',
  'spaghetti-frutti-di-mare':
    'Spaghetti aux fruits de mer, ail, oignons, tomates cerises et huile d’olive à la sauce tomate maison',
  'spaghetti-carbonara':
    'Spaghetti avec dés de lard grillés, jaune d’œuf et Grana Padano à la sauce crème',
  'spaghetti-vegetariana':
    'Spaghetti aux légumes, oignons et ail à la sauce tomate maison',
  'spaghetti-napoli':
    'Spaghetti à la sauce tomate maison, oignons, ail et basilic',
  'spaghetti-al-pesto':
    'Spaghetti à la sauce crème au pesto maison',
  'spaghetti-bolognese':
    'Spaghetti à la sauce bolognaise maison au bœuf',
  'gamberoni-alla-griglia':
    'Gambas grillées, servies avec légumes et accompagnement au choix',
  'gamberi-luna-piccante':
    'Gambas poêlées flambées au cognac avec piments frais, ail, herbes fraîches, basilic et tomates cerises, servies avec légumes et accompagnement au choix',
  'salmone-alla-griglia':
    'Filet de saumon grillé, servi avec légumes et accompagnement au choix',
  'controfiletto-di-manzo-alla-griglia':
    'Entrecôte de bœuf grillée, servie avec légumes et accompagnement au choix',
  'controfiletto-di-manzo-al-pepe-verde':
    'Entrecôte de bœuf grillée à la sauce au poivre vert, servie avec légumes et accompagnement au choix',
  'controfiletto-d-agnello-alla-griglia':
    'Filet d’agneau rosé grillé, servi avec légumes et accompagnement au choix',
  'controfiletto-d-agnello-alla-montanara':
    'Filet d’agneau rosé grillé à la sauce crème aux champignons des bois, servi avec légumes et accompagnement au choix',
  'petto-di-pollo-alla-griglia':
    'Blanc de poulet grillé, servi avec légumes et accompagnement au choix',
  'maiale-impanato':
    'Escalope de porc panée, servie avec légumes et accompagnement au choix',
  'scaloppina-di-vitello-al-limone':
    'Escalope de veau à la sauce citron, servie avec légumes et accompagnement au choix',
  'saltimbocca-alla-romana':
    'Escalope de veau avec jambon de Parme et sauge à la sauce Marsala, servie avec légumes et accompagnement au choix',
  'scaloppina-di-vitello-alla-crema-di-funghi':
    'Escalope de veau à la sauce crème aux champignons, servie avec légumes et accompagnement au choix',
  'affettato-alla-zurighese':
    'Émincé de veau à la zurichoise à la sauce crème aux champignons, servi avec légumes et accompagnement au choix',
  rindsentrecote:
    'Steak de bœuf',
  schweinesteak:
    'Steak de porc',
  'lamm-nierstuck':
    'Agneau',
  'rindsfleisch-spiess':
    'Brochette de bœuf',
  'gemischter-spiess':
    'Brochette mixte de porc et de bœuf',
  curry:
    'Sauce tomate, mozzarella, poulet au curry, champignons, origan',
  bbq:
    'Sauce tomate, mozzarella, poulet BBQ, champignons, oignons, maïs, origan',
  'al-capone':
    'Sauce tomate, mozzarella, lamelles de bœuf, Café de Paris, poivre vert, origan',
  lunatico:
    'Sauce tomate, mozzarella, lamelles de bœuf, poivre vert, origan',
  napoli:
    'Sauce tomate, mozzarella, anchois, câpres, origan',
  salmone:
    'Sauce tomate, mozzarella, saumon fumé, origan',
  tonno:
    'Sauce tomate, mozzarella, thon, rondelles d’oignon, câpres, origan',
  gamberetti:
    'Sauce tomate, mozzarella, crevettes, ail, origan',
  'frutti-di-mare':
    'Sauce tomate, mozzarella, fruits de mer, ail, origan',
  agnello:
    'Sauce tomate, mozzarella, lamelles d’agneau, ail, romarin',
  casanova:
    'Sauce tomate, mozzarella, lamelles de veau, épinards, piments, origan',
  'quattro-formaggi':
    'Sauce tomate, mozzarella, 3 sortes de fromages, origan',
  'alla-piemontese':
    'Sauce tomate, mozzarella, cèpes, origan',
  pinocchio:
    'Sauce tomate, mozzarella, olives, maïs, poivrons, origan',
  margherita:
    'Sauce tomate, mozzarella, origan',
  buffala:
    'Sauce tomate, mozzarella, tomates cerises, mozzarella di bufala, basilic',
  vegetariana:
    'Sauce tomate, mozzarella, épinards, poivrons, aubergine, origan',
  caprese:
    'Sauce tomate, mozzarella, tranches de tomates, oignons, origan',
  tricolore:
    'Sauce tomate, mozzarella, tranches de tomates, épinards, séré, origan',
  oliva:
    'Sauce tomate, mozzarella, olives, origan',
  melanzane:
    'Sauce tomate, mozzarella, aubergine, ail, origan',
  paprika:
    'Sauce tomate, mozzarella, poivrons, origan',
  carbonara:
    'Sauce tomate, mozzarella, lardons, œuf au plat, copeaux de Grana Padano, origan',
  lucifer:
    'Sauce tomate, mozzarella, lardons, salami piquant, piments frais, origan',
  calzone:
    'Pizza fermée avec mozzarella, jambon, séré et sauce tomate',
  'salame-nostrano':
    'Sauce tomate, mozzarella, salami, origan',
  antonio:
    'Sauce tomate, mozzarella, jambon, gorgonzola, poire, piments, origan',
  'quattro-stagioni':
    'Sauce tomate, mozzarella, jambon, champignons, artichauts, poivrons, origan',
  prosciutto:
    'Sauce tomate, mozzarella, jambon, origan',
  'prosciutto-e-funghi':
    'Sauce tomate, mozzarella, jambon, champignons, origan',
  hawaii:
    'Sauce tomate, mozzarella, jambon, ananas, origan',
  gorgonzola:
    'Sauce tomate, mozzarella, jambon, gorgonzola, origan',
  boscaiolo:
    'Sauce tomate, mozzarella, salami, lardons, oignons, œuf au plat, origan',
  piccante:
    'Sauce tomate, mozzarella, salami piquant, origan',
  parma:
    'Sauce tomate, mozzarella, jambon de Parme, origan',
  parmigiana:
    'Sauce tomate, mozzarella, aubergine, jambon de Parme, Grana Padano, origan',
}

function findMonorepoRoot(startDir) {
  let dir = startDir
  for (let index = 0; index < 12; index += 1) {
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
Seed Luna Piccante French translation cache.

Dry-run by default. Pass --commit to write.

Usage:
  node scripts/seed-luna-french-translation-cache.mjs [--commit]

Options:
  --commit                         Write Firestore cache docs.
  --project <id>                   Firebase project id.
  --database <id>                  Firestore database id. Defaults to misebox.
  --service-account <path>         Service account JSON path.
`)
}

function sourceHash(sourceText) {
  return createHash('sha256').update(normalizeString(sourceText), 'utf8').digest('hex')
}

function makeMenuTranslationCacheKey(fieldId, targetLanguage) {
  const fieldHash = createHash('sha256')
    .update([normalizeString(fieldId), normalizeString(targetLanguage)].join('\n'), 'utf8')
    .digest('hex')

  if (!fieldId || !targetLanguage) return ''
  return `${targetLanguage}__${fieldHash.slice(0, 40)}`
}

function updatedStamp() {
  return {
    at: FieldValue.serverTimestamp(),
    by: SYSTEM_ACTOR,
    app_id: APP_ID,
  }
}

function buildCacheDoc({ fieldId, sourceText, translatedText, sourceLanguage = 'default' }) {
  const id = makeMenuTranslationCacheKey(fieldId, TARGET_LANGUAGE)

  return {
    id,
    field_id: fieldId,
    domain: DOMAIN,
    glossary_version: GLOSSARY_VERSION,
    source_language: sourceLanguage,
    target_language: TARGET_LANGUAGE,
    source_text: normalizeString(sourceText),
    translated_text: normalizeString(translatedText),
    provider: 'manual',
    reviewed: true,
    certified: false,
    source_hash: sourceHash(sourceText),
    usage_count: 0,
    created: updatedStamp(),
    updated: updatedStamp(),
  }
}

function menuFieldId(menuId, field) {
  return `menu:${menuId}:${field}`
}

function sectionFieldId(menuId, sectionId, field) {
  return `menu:${menuId}:section:${sectionId}:${field}`
}

function itemFieldId(menuId, sectionId, itemId, field) {
  return `menu:${menuId}:section:${sectionId}:item:${itemId}:${field}`
}

function dishFieldId(dishId, field) {
  return `dish:${dishId}:${field}`
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
  const commit = Boolean(args.commit)
  const app = initializeApp(
    { credential: cert(account), projectId },
    'seed-luna-french-translation-cache'
  )
  const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app)
  const kitchenRef = db.collection('kitchens').doc(LUNA_KITCHEN_ID)
  const menuRefs = MENU_IDS.map((menuId) => kitchenRef.collection('menus').doc(menuId))
  const menuSnaps = await Promise.all(menuRefs.map((ref) => ref.get()))
  const cacheDocsByMenu = new Map()
  const missingDishDescriptions = []
  const missingMenus = []

  for (const menuSnap of menuSnaps) {
    if (!menuSnap.exists) {
      missingMenus.push(menuSnap.ref.id)
      continue
    }

    const menu = menuSnap.data() || {}
    const menuId = menuSnap.ref.id
    const docs = []
    const add = (fieldId, sourceText, translatedText, sourceLanguage = 'default') => {
      const source = normalizeString(sourceText)
      const translated = normalizeString(translatedText)
      if (!fieldId || !source || !translated) return
      docs.push(buildCacheDoc({ fieldId, sourceText: source, translatedText: translated, sourceLanguage }))
    }

    add(menuFieldId(menuId, 'name'), menu.name || menuId, FRENCH_MENU_NAMES[menuId])
    add(menuFieldId(menuId, 'description'), menu.description, '')

    const dishIds = new Set()
    for (const section of Array.isArray(menu.sections) ? menu.sections : []) {
      const sectionId = normalizeString(section.id)
      const sectionLabel = normalizeString(section.label)
      add(
        sectionFieldId(menuId, sectionId, 'label'),
        sectionLabel,
        FRENCH_SECTION_LABELS[menuId]?.[sectionId]
      )
      add(sectionFieldId(menuId, sectionId, 'description'), section.description, '')

      for (const item of Array.isArray(section.items) ? section.items : []) {
        const itemId = normalizeString(item.id)
        const dishId = normalizeString(item.dish_id)
        if (dishId) {
          dishIds.add(dishId)
          continue
        }

        const inline = FRENCH_INLINE_ITEMS[menuId]?.[itemId]
        add(itemFieldId(menuId, sectionId, itemId, 'label'), item.label, inline?.label)
        add(
          itemFieldId(menuId, sectionId, itemId, 'description'),
          item.description,
          inline?.description
        )
      }
    }

    const dishSnaps = await Promise.all(
      Array.from(dishIds).map((dishId) => kitchenRef.collection('dishes').doc(dishId).get())
    )

    for (const dishSnap of dishSnaps) {
      if (!dishSnap.exists) continue

      const dish = dishSnap.data() || {}
      const dishId = dishSnap.ref.id
      add(dishFieldId(dishId, 'name'), dish.name || dishId, dish.name || dishId)

      const translatedDescription = FRENCH_DISH_DESCRIPTIONS[dishId]
      if (!translatedDescription) missingDishDescriptions.push(dishId)
      add(
        dishFieldId(dishId, 'description'),
        dish.description,
        translatedDescription
      )
    }

    cacheDocsByMenu.set(menuId, docs)
  }

  const totalDocs = Array.from(cacheDocsByMenu.values()).reduce(
    (count, docs) => count + docs.length,
    0
  )

  console.log('[seed-luna-french-translation-cache] prepared', {
    commit,
    projectId,
    databaseId,
    serviceAccount: resolvedServiceAccountPath,
    kitchenPath: `kitchens/${LUNA_KITCHEN_ID}`,
    menus: Object.fromEntries(
      Array.from(cacheDocsByMenu.entries()).map(([menuId, docs]) => [menuId, docs.length])
    ),
    totalDocs,
    missingMenus,
    missingDishDescriptions,
  })

  if (!commit) return

  let batch = db.batch()
  let ops = 0
  for (const [menuId, docs] of cacheDocsByMenu.entries()) {
    for (const doc of docs) {
      batch.set(
        kitchenRef.collection('menus').doc(menuId).collection('translation_cache').doc(doc.id),
        doc,
        { merge: false }
      )
      ops += 1
      if (ops >= 450) {
        await batch.commit()
        batch = db.batch()
        ops = 0
      }
    }
  }

  if (ops > 0) await batch.commit()

  console.log('[seed-luna-french-translation-cache] done', {
    written: totalDocs,
    cachePaths: MENU_IDS.map((menuId) =>
      `kitchens/${LUNA_KITCHEN_ID}/menus/${menuId}/translation_cache`
    ),
  })
}

main().catch((error) => {
  console.error('[seed-luna-french-translation-cache] failed', error)
  process.exitCode = 1
})
