import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { isDeepStrictEqual } from 'node:util'
import { initializeApp, cert, deleteApp } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'

export const projectId = 'misebox-78f9c'
export const databaseId = 'misebox'
export const kitchenId = 'ChIJ08WSgYSjj0cRD6oE3RwUFk0'
const actor = 'system:la-tap-prep-import'
const directory = path.dirname(fileURLToPath(import.meta.url))
const digest = (value) => createHash('sha256').update(value).digest('hex')
const sourceHash = (inputFile) =>
  digest(
    fs.readFileSync(import.meta.filename) + fs.readFileSync(inputFile, 'utf8')
  )
const withoutId = ({ id: _id, ...data }) => data
const identifier = (id) => typeof id === 'string' && /^[a-z0-9-]+$/.test(id)
const check = (condition, message) => {
  if (!condition) throw new Error(message)
}

export function buildImportRecords(input) {
  const outputs = new Set(input.preparations.map((row) => row.id))
  check(outputs.size === input.preparations.length, 'Duplicate Preparation')
  check(
    new Set(input.recipes.map((row) => row.id)).size === input.recipes.length,
    'Duplicate Recipe'
  )
  const ingredientIds = new Set()
  for (const recipe of input.recipes) {
    check(
      identifier(recipe.id) && outputs.has(recipe.output_preparation_id),
      'Unresolved output'
    )
    check(
      recipe.yield?.quantity > 0 && recipe.yield.unit && recipe.method?.length,
      'Incomplete recipe'
    )
    check(
      new URL(recipe.source.url).protocol === 'https:',
      'Missing source attribution'
    )
    for (const row of recipe.inputs) {
      check(
        identifier(row.reference_id) &&
          Number.isFinite(row.quantity) &&
          row.quantity > 0 &&
          row.unit,
        'Invalid recipe input'
      )
      check(
        ['ingredient', 'preparation'].includes(row.kind),
        'Invalid input kind'
      )
      if (row.kind === 'preparation')
        check(outputs.has(row.reference_id), 'Unresolved Preparation input')
      else ingredientIds.add(row.reference_id)
    }
  }
  const records = [
    ...input.preparations.map((row) => ({
      path: `kitchens/${kitchenId}/prep-items/${row.id}`,
      data: withoutId(row),
    })),
    ...input.recipes.map((row) => ({
      path: `kitchens/${kitchenId}/recipes/${row.id}`,
      data: withoutId(row),
    })),
    ...input.ingredients.map((row) => ({
      path: `ingredients/${row.id}`,
      data: { ...withoutId(row), slug: row.id, aliases: [], status: 'active' },
    })),
    ...[...ingredientIds].sort().map((id) => ({
      path: `kitchens/${kitchenId}/ingredients/${id}`,
      data: { ingredient_id: id },
    })),
  ]
  check(
    records.every(
      (row) =>
        identifier(row.path.split('/').at(-1)) &&
        typeof (row.data.name || row.data.ingredient_id) === 'string'
    ),
    'Invalid record identity'
  )
  check(
    new Set(records.map((row) => row.path)).size === records.length,
    'Duplicate target'
  )
  return { records, ingredientIds: [...ingredientIds].sort() }
}

function verifyKitchen(snapshot) {
  check(
    snapshot.exists &&
      snapshot.data().slug === 'la-tapberne' &&
      snapshot.data().management?.app_id === 'la-tap-berne',
    'La Tap Kitchen identity changed'
  )
}
const version = (row) =>
  row.updateTime
    ? {
        seconds: row.updateTime.seconds,
        nanoseconds: row.updateTime.nanoseconds,
      }
    : null
const snapshot = (row) => ({
  path: row.ref.path,
  exists: row.exists,
  updateTime: version(row),
  data: row.data() || null,
})

export async function run(
  mode,
  outputDirectory,
  confirmation,
  inputFile = path.join(directory, 'records.json')
) {
  check(
    false,
    'Retired import: these guessed recipes are not La Tap source material'
  )
  inputFile = path.resolve(inputFile)
  const input = JSON.parse(fs.readFileSync(inputFile, 'utf8'))
  const { records, ingredientIds } = buildImportRecords(input)
  const appDirectory = path.resolve(
    directory,
    '../../../projects/misebox/misebox-app'
  )
  process.loadEnvFile(path.join(appDirectory, '.env'))
  const credential = JSON.parse(
    fs.readFileSync(
      path.resolve(appDirectory, process.env.FIREBASE_SERVICE_ACCOUNT_FILE),
      'utf8'
    )
  )
  check(credential.project_id === projectId, 'Credential project mismatch')
  const app = initializeApp(
    { credential: cert(credential), projectId },
    'la-tap-prep-import'
  )
  const db = getFirestore(app, databaseId)
  const rootPath = `kitchens/${kitchenId}`
  const targetPaths = new Set(records.map((row) => row.path))
  const paths = [
    rootPath,
    ...new Set([
      ...targetPaths,
      ...ingredientIds.map((id) => `ingredients/${id}`),
    ]),
  ]
  try {
    if (mode === 'plan') {
      fs.mkdirSync(outputDirectory, { mode: 0o700 })
      const current = await db.getAll(...paths.map((value) => db.doc(value)))
      verifyKitchen(current[0])
      const byPath = new Map(current.map((row) => [row.ref.path, row]))
      for (const id of ingredientIds) {
        const row = byPath.get(`ingredients/${id}`)
        check(
          row.exists || records.some((record) => record.path === row.ref.path),
          `Missing Ingredient ${id}`
        )
        if (row.exists)
          check(
            row.data().status === 'active' && row.data().name,
            `Inactive Ingredient ${id}`
          )
      }
      const planned = records.map((record) => {
        const before = byPath.get(record.path)
        if (before.exists) {
          check(
            record.path.startsWith('ingredients/') ||
              record.path.includes('/ingredients/'),
            `Existing record would be overwritten: ${record.path}`
          )
          check(
            record.data.ingredient_id
              ? before.data().ingredient_id === record.data.ingredient_id
              : before.data().name === record.data.name,
            'Conflicting Ingredient'
          )
        }
        return { ...record, action: before.exists ? 'retain' : 'create' }
      })
      const plan = {
        projectId,
        databaseId,
        kitchenId,
        sourceHash: sourceHash(inputFile),
        inputFile,
        preimages: current.map(snapshot),
        records: planned,
      }
      const content = JSON.stringify(plan, null, 2) + '\n'
      fs.writeFileSync(path.join(outputDirectory, 'plan.json'), content, {
        mode: 0o600,
        flag: 'wx',
      })
      console.log(
        JSON.stringify({
          target: `${projectId}/${databaseId}/${rootPath}`,
          create: planned.filter((row) => row.action === 'create').length,
          retain: planned.filter((row) => row.action === 'retain').length,
          sha256: digest(content),
        })
      )
      return
    }
    check(mode === 'apply', 'Use plan or apply')
    const content = fs.readFileSync(
      path.join(outputDirectory, 'plan.json'),
      'utf8'
    )
    check(
      confirmation && digest(content) === confirmation,
      'Exact plan confirmation required'
    )
    const plan = JSON.parse(content)
    check(
      plan.sourceHash === sourceHash(inputFile) &&
        plan.inputFile === inputFile &&
        plan.projectId === projectId &&
        plan.databaseId === databaseId &&
        plan.kitchenId === kitchenId,
      'Plan source/target mismatch'
    )
    check(
      JSON.stringify(plan.records.map(({ action: _action, ...row }) => row)) ===
        JSON.stringify(records),
      'Plan records changed'
    )
    const now = Timestamp.now()
    const created = { at: now, by: actor, app_id: 'misebox-app' }
    const updated = { at: now, by: actor }
    await db.runTransaction(async (tx) => {
      const current = await tx.getAll(...paths.map((value) => db.doc(value)))
      verifyKitchen(current[0])
      check(
        current.every(
          (row, index) =>
            row.exists === plan.preimages[index].exists &&
            isDeepStrictEqual(version(row), plan.preimages[index].updateTime)
        ),
        'A preimage changed; make a fresh plan'
      )
      for (const record of plan.records.filter(
        (row) => row.action === 'create'
      ))
        tx.create(db.doc(record.path), { ...record.data, created, updated })
    })
    const postimages = await db.getAll(...paths.map((value) => db.doc(value)))
    for (const record of plan.records) {
      const row = postimages.find((value) => value.ref.path === record.path)
      check(row.exists, 'Created record is missing')
      if (record.action === 'create') {
        const { created: stamp, updated: _updated, ...data } = row.data()
        check(
          isDeepStrictEqual(data, record.data) && stamp.by === actor,
          'Postimage verification failed'
        )
      }
    }
    fs.writeFileSync(
      path.join(outputDirectory, 'receipt.json'),
      JSON.stringify(
        {
          target: `${projectId}/${databaseId}`,
          planHash: confirmation,
          created: plan.records
            .filter((row) => row.action === 'create')
            .map((row) => row.path),
          postimages: postimages.map(snapshot),
        },
        null,
        2
      ) + '\n',
      { mode: 0o600, flag: 'wx' }
    )
    console.log(
      JSON.stringify({
        created: plan.records.filter((row) => row.action === 'create').length,
        verified: true,
      })
    )
  } finally {
    await db.terminate()
    await deleteApp(app)
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const [mode, outputDirectory, confirmation, inputFile] = process.argv.slice(2)
  check(outputDirectory, 'Provide a fresh protected plan directory')
  await run(mode, outputDirectory, confirmation, inputFile)
}
