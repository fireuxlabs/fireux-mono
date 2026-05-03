#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'
import vm from 'node:vm'
import { parseArgs } from './_lib/args.mjs'

const DEFAULT_DATABASE_ID = 'misebox-simulation'
const ROOT_COLLECTION = 'kitchens'
const DEFAULT_SERVICE_ACCOUNT =
  'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json'
const DEFAULT_SCENARIO_PATH =
  'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/utils/kitchen-demo-scenarios/index.ts'

const args = parseArgs(process.argv.slice(2))
const serviceAccountPath = String(args['service-account'] || DEFAULT_SERVICE_ACCOUNT).trim()
const scenarioPath = String(args.scenario || DEFAULT_SCENARIO_PATH).trim()
const databaseId = String(args.database || DEFAULT_DATABASE_ID).trim()
const kitchenId = String(args.kitchen || '').trim()
const commit = Boolean(args.commit)
const prune = args.prune !== false && args.prune !== 'false'

if (!kitchenId) {
  console.error(
    'Usage: node scripts/sync-misebox-test-kitchen.mjs --kitchen <testKitchenId> [--commit]'
  )
  process.exit(1)
}

if (databaseId !== DEFAULT_DATABASE_ID && !args['allow-non-misebox-database']) {
  console.error(
    `Refusing to sync Misebox test data to database "${databaseId}". ` +
      `Use --database ${DEFAULT_DATABASE_ID} or pass --allow-non-misebox-database.`
  )
  process.exit(1)
}

const loadDefaultDemoKitchen = async () => {
  const source = await readFile(scenarioPath, 'utf8')
  const js = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText
  const module = { exports: {} }

  vm.runInNewContext(
    js,
    { module, exports: module.exports, console, structuredClone },
    { filename: scenarioPath }
  )

  if (typeof module.exports.getDefaultDemoKitchen !== 'function') {
    throw new Error(`Missing getDefaultDemoKitchen export in ${scenarioPath}`)
  }

  return module.exports.getDefaultDemoKitchen()
}

const asDocs = (value) => (Array.isArray(value) ? value : [])

const withKitchenId = (docs, nextKitchenId) =>
  docs.map((doc) => ({
    ...doc,
    id: String(doc.id || '').trim(),
    kitchen_id: nextKitchenId,
  }))

const buildKitchenIngredientsForSync = (demoKitchenScenario) => {
  const map = new Map()

  for (const entry of demoKitchenScenario.kitchenIngredients) {
    const id = String(entry.id || entry.ingredient_id || '').trim()
    if (!id) continue

    map.set(id, {
      ...entry,
      id,
      ingredient_id: String(entry.ingredient_id || id).trim(),
    })
  }

  return [...map.values()]
}

const chunk = (items, size) => {
  const chunks = []
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size))
  }
  return chunks
}

const stripUndefined = (value) => {
  if (Array.isArray(value)) return value.map((entry) => stripUndefined(entry))
  if (!value || typeof value !== 'object') return value

  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entry]) => entry !== undefined)
      .map(([key, entry]) => [key, stripUndefined(entry)])
  )
}

const writeCollection = async ({ db, kitchenRef, name, docs }) => {
  const keepIds = new Set()

  for (const group of chunk(docs, 450)) {
    const batch = db.batch()

    for (const entry of group) {
      const id = String(entry.id || '').trim()
      if (!id) continue
      keepIds.add(id)
      batch.set(kitchenRef.collection(name).doc(id), stripUndefined(entry), {
        merge: false,
      })
    }

    await batch.commit()
  }

  let pruned = 0
  if (prune) {
    const snap = await kitchenRef.collection(name).get()
    const stale = snap.docs.filter((docSnap) => !keepIds.has(docSnap.id))

    for (const group of chunk(stale, 450)) {
      const batch = db.batch()
      for (const docSnap of group) batch.delete(docSnap.ref)
      await batch.commit()
      pruned += group.length
    }
  }

  return { written: keepIds.size, pruned }
}

const buildOperationalCollections = (demoKitchenScenario, nextKitchenId) => ({
  ingredients: buildKitchenIngredientsForSync(demoKitchenScenario),
  mise: withKitchenId(asDocs(demoKitchenScenario.menuStack.miseTasks), nextKitchenId),
  recipes: withKitchenId(asDocs(demoKitchenScenario.menuStack.recipes), nextKitchenId),
  dishes: withKitchenId(asDocs(demoKitchenScenario.menuStack.dishes), nextKitchenId),
  menus: withKitchenId(asDocs(demoKitchenScenario.menuStack.menus), nextKitchenId),
  suppliers: withKitchenId(asDocs(demoKitchenScenario.procurementStack.suppliers), nextKitchenId),
  supplierIngredients: withKitchenId(
    asDocs(demoKitchenScenario.procurementStack.supplierIngredients),
    nextKitchenId
  ),
  purchases: withKitchenId(asDocs(demoKitchenScenario.procurementStack.purchases), nextKitchenId),
  orders: withKitchenId(asDocs(demoKitchenScenario.serviceStack.incomingOrders), nextKitchenId),
})

const syncKitchen = async ({
  db,
  kitchenRef,
  kitchenId: nextKitchenId,
  demoKitchenScenario,
  simulationKind,
  canWrite,
  identity,
}) => {
  const existingKitchen = (await kitchenRef.get()).data() || {}
  const collections = buildOperationalCollections(demoKitchenScenario, nextKitchenId)

  await kitchenRef.set(
    stripUndefined({
      id: nextKitchenId,
      place_id: String(existingKitchen.place_id || identity.place_id || nextKitchenId).trim(),
      slug: String(existingKitchen.slug || identity.slug || nextKitchenId).trim(),
      name: String(existingKitchen.name || identity.name || nextKitchenId).trim(),
      short_address: String(existingKitchen.short_address || identity.short_address || '').trim(),
      image_url: existingKitchen.image_url || identity.image_url || undefined,
      is_test_kitchen: simulationKind === 'test',
      simulation_kind: simulationKind,
      can_write: canWrite,
      updated: { at: FieldValue.serverTimestamp() },
      created: existingKitchen.created || { at: FieldValue.serverTimestamp() },
    }),
    { merge: true }
  )

  const writeSummary = {}
  for (const [name, docs] of Object.entries(collections)) {
    writeSummary[name] = await writeCollection({ db, kitchenRef, name, docs })
  }

  return {
    kitchenPath: kitchenRef.path,
    collections: Object.fromEntries(
      Object.entries(collections).map(([name, docs]) => [name, docs.length])
    ),
    writeSummary,
  }
}

const serviceAccount = JSON.parse(await readFile(serviceAccountPath, 'utf8'))
const projectId = String(serviceAccount.project_id || '').trim()
if (!projectId) throw new Error('Could not resolve project id from service account.')

const app = initializeApp(
  {
    credential: cert(serviceAccount),
    projectId,
  },
  `sync-misebox-test-kitchen-${Date.now()}`
)
const db = getFirestore(app, databaseId)
const demoKitchenScenario = await loadDefaultDemoKitchen()
const testKitchenRef = db.collection(ROOT_COLLECTION).doc(kitchenId)
const previewCollections = buildOperationalCollections(demoKitchenScenario, kitchenId)

const summary = {
  projectId,
  databaseId,
  commit,
  rootCollection: ROOT_COLLECTION,
  demoSource: scenarioPath,
  testKitchenPath: testKitchenRef.path,
  collections: Object.fromEntries(
    Object.entries(previewCollections).map(([name, docs]) => [name, docs.length])
  ),
}

console.log(JSON.stringify(summary, null, 2))

if (!commit) {
  console.log('Dry run only. Re-run with --commit to write.')
  process.exit(0)
}

const testWriteSummary = await syncKitchen({
  db,
  kitchenRef: testKitchenRef,
  kitchenId,
  demoKitchenScenario,
  simulationKind: 'test',
  canWrite: true,
  identity: {
    place_id: kitchenId,
    slug: 'test-kitchen',
    name: 'Test Kitchen',
    short_address: 'Daniel Watson',
  },
})

console.log(
  JSON.stringify(
    {
      ...summary,
      testWriteSummary,
    },
    null,
    2
  )
)
