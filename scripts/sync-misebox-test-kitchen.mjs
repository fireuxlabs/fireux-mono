#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
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
  'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/demo/kitchen/scenarios/index.ts'

const args = parseArgs(process.argv.slice(2))
const serviceAccountPath = String(args['service-account'] || DEFAULT_SERVICE_ACCOUNT).trim()
const scenarioPath = String(args.scenario || DEFAULT_SCENARIO_PATH).trim()
const databaseId = String(args.database || DEFAULT_DATABASE_ID).trim()
const kitchenId = String(args.kitchen || '').trim()
const commit = Boolean(args.commit)
const prune = args.prune !== false && args.prune !== 'false'
const ensureRoot = Boolean(args['ensure-root'])

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

const normalizeSlug = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const resolveFirstName = (displayName, userId) => {
  const name = String(displayName || '').trim()
  const firstName = name.split(/\s+/).find(Boolean)
  if (firstName) return firstName

  const id = String(userId || '').trim()
  return id ? `User ${id.slice(0, 6)}` : 'User'
}

const resolveTestKitchenName = (displayName, userId) =>
  `${resolveFirstName(displayName, userId)}'s Test Kitchen`

const resolveTestKitchenSlug = (displayName, userId) =>
  normalizeSlug(resolveTestKitchenName(displayName, userId)) || 'user-test-kitchen'

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
  mise: withKitchenId(asDocs(demoKitchenScenario.menuStack.miseTasks), nextKitchenId),
  recipes: withKitchenId(asDocs(demoKitchenScenario.menuStack.recipes), nextKitchenId),
  dishes: withKitchenId(asDocs(demoKitchenScenario.menuStack.dishes), nextKitchenId),
  menus: withKitchenId(asDocs(demoKitchenScenario.menuStack.menus), nextKitchenId),
  stations: withKitchenId(asDocs(demoKitchenScenario.menuStack.stations), nextKitchenId),
  team: withKitchenId(asDocs(demoKitchenScenario.menuStack.team), nextKitchenId),
  suppliers: withKitchenId(asDocs(demoKitchenScenario.procurementStack.suppliers), nextKitchenId),
  purchases: withKitchenId(asDocs(demoKitchenScenario.procurementStack.purchases), nextKitchenId),
  orders: withKitchenId(asDocs(demoKitchenScenario.serviceStack.incomingOrders), nextKitchenId),
})

const readUserIdentity = async (app, userId) => {
  const id = String(userId || '').trim()
  if (!id) return { displayName: '', photoURL: '' }

  try {
    const user = await getAuth(app).getUser(id)
    return {
      displayName: String(user.displayName || '').trim(),
      photoURL: String(user.photoURL || '').trim(),
    }
  } catch {
    return { displayName: '', photoURL: '' }
  }
}

const syncKitchen = async ({
  db,
  kitchenRef,
  kitchenId: nextKitchenId,
  demoKitchenScenario,
  simulationKind,
  canWrite,
  identity,
}) => {
  const existingKitchenSnap = await kitchenRef.get()
  const existingKitchen = existingKitchenSnap.data() || {}
  const collections = buildOperationalCollections(demoKitchenScenario, nextKitchenId)

  if (!existingKitchenSnap.exists && !ensureRoot) {
    throw new Error(
      `Missing test kitchen root "${kitchenRef.path}". Join/create the Test Kitchen first, or pass --ensure-root.`
    )
  }

  if (ensureRoot) {
    await kitchenRef.set(
      stripUndefined({
        id: nextKitchenId,
        place_id: String(identity.place_id || nextKitchenId).trim(),
        slug: String(identity.slug || nextKitchenId).trim(),
        display_name: String(identity.display_name || nextKitchenId).trim(),
        display_image_url:
          existingKitchen.display_image_url ||
          identity.display_image_url ||
          undefined,
        name: FieldValue.delete(),
        short_address: FieldValue.delete(),
        image_url: FieldValue.delete(),
        is_test_kitchen: simulationKind === 'test',
        simulation_kind: simulationKind,
        can_write: canWrite,
        updated: { at: FieldValue.serverTimestamp() },
        created: existingKitchen.created || { at: FieldValue.serverTimestamp() },
      }),
      { merge: true }
    )
  }

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
const testUserIdentity = await readUserIdentity(app, kitchenId)

const summary = {
  projectId,
  databaseId,
  commit,
  ensureRoot,
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
    slug: resolveTestKitchenSlug(testUserIdentity.displayName, kitchenId),
    display_name: resolveTestKitchenName(testUserIdentity.displayName, kitchenId),
    display_image_url: testUserIdentity.photoURL || undefined,
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
