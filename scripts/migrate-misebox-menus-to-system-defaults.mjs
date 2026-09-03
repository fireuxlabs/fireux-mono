#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-09-03
// usage_note: plan or apply the protected cutover of proved legacy Kitchen Menus into Food and Drinks defaults.

import { createHash } from 'node:crypto'
import { deleteApp, initializeApp } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { defineFirestoreMutationTarget } from '../packages/core/fireux-core/src/runtime/utils/firestore-mutations/target-definition.ts'
import { parseArgs } from './_lib/args.mjs'
import { resolveFirebaseAdminCredential } from './_lib/firebase-admin-credentials.mjs'
import { mcpSkillCreate } from './_lib/firestore-mutations/mcp-skill-create.mjs'
import { mcpSkillUpdate } from './_lib/firestore-mutations/mcp-skill-update.mjs'
import { writeProtectedJsonArtifact } from './_lib/protected-json-artifact.mjs'

const PROJECT_ID = 'misebox-78f9c'
const DATABASE_ID = 'misebox'
const ACTOR = 'system:migrate-misebox-menus-to-system-defaults'
const fixture = (kitchenId, kitchenSlug, sourceMenuId, options = {}) => ({
  kitchenId,
  kitchenSlug,
  sourceMenuId,
  ...options,
})
const FIXTURES = [
  fixture(
    'ChIJE-GP3-Kjj0cRzAv0WviwcsY',
    'baeren-ringgenberg',
    'pizza-snacks-drinks',
    {
      drinkSections: [
        'getraenke-ohne-alkohol',
        'xxl-cocktails-nur-ueber-18',
        'bier',
      ],
    }
  ),
  fixture('bergwelt-grindelwald', 'bergwelt-grindelwald', 'main', {
    defaultKind: 'food',
  }),
  fixture('5dGJgdjDv7Zi0tjva61O', 'friiites-interlaken', 'friiites', {
    defaultKind: 'food',
  }),
  fixture(
    'ChIJiaQnB9OPj0cRERKcpQeDAaQ',
    'indian-gourmet-restaurant-pizzeria',
    'main'
  ),
  fixture('ChIJ08WSgYSjj0cRD6oE3RwUFk0', 'la-tapberne', 'main', {
    defaultKind: 'food',
  }),
  fixture('ChIJ93_ggY-jj0cRTCyLcfBuK2w', 'luna-piccante', 'main-menu', {
    defaultKind: 'food',
  }),
]
const args = parseArgs(process.argv.slice(2))
const apply = args.apply === true
const text = (value) => String(value ?? '').trim()
const record = (value) =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {}
const stable = (value) => {
  if (value == null || typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map(stable)
  if (typeof value.toDate === 'function') {
    return { __timestamp: value.toDate().toISOString() }
  }
  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, child]) => [key, stable(child)])
  )
}
const sha256 = (value) =>
  createHash('sha256')
    .update(JSON.stringify(stable(value)))
    .digest('hex')
const rootId = (fixture, kind) => `${fixture.kitchenSlug}--${kind}`
const target = (key, collectionPath, verbs) =>
  defineFirestoreMutationTarget({
    key,
    lane: 'mcp-skill',
    verbs,
    database: { kind: 'named', databaseId: DATABASE_ID },
    collectionPath,
  })
const countMenuItems = async (menuRef) => {
  const sections = await menuRef.collection('sections').get()
  let count = 0
  for (const section of sections.docs) {
    count += (await section.ref.collection('items').count().get()).data().count
  }
  return count
}

if (text(args.project) !== PROJECT_ID || text(args.database) !== DATABASE_ID) {
  throw new Error(`Use --project=${PROJECT_ID} --database=${DATABASE_ID}.`)
}
const auth = await resolveFirebaseAdminCredential({
  args,
  scope: 'misebox',
  projectId: PROJECT_ID,
})
const app = initializeApp(
  { credential: auth.credential, projectId: PROJECT_ID },
  `migrate-misebox-menus-to-system-defaults-${Date.now()}`
)
const db = getFirestore(app, DATABASE_ID)
const migrations = []

for (const fixture of FIXTURES) {
  const basePath = `kitchens/${fixture.kitchenId}/menus`
  const sourceRef = db.doc(`${basePath}/${fixture.sourceMenuId}`)
  const foodRef = db.doc(`${basePath}/food`)
  const drinksRef = db.doc(`${basePath}/drinks`)
  const oldRootRef = db.doc(
    `menus/${fixture.kitchenSlug}--${fixture.sourceMenuId}`
  )
  const [kitchen, source, food, drinks, oldRoot] = await db.getAll(
    db.doc(`kitchens/${fixture.kitchenId}`),
    sourceRef,
    foodRef,
    drinksRef,
    oldRootRef
  )
  if (![kitchen, source, food, drinks, oldRoot].every((snap) => snap.exists)) {
    throw new Error(`Required source is missing for ${fixture.kitchenSlug}.`)
  }
  if (
    !['published', 'archived'].includes(text(source.get('status'))) ||
    !['published', 'archived'].includes(text(oldRoot.get('status')))
  ) {
    throw new Error(
      `Legacy source has an invalid status for ${fixture.kitchenSlug}.`
    )
  }

  const sections = []
  const sourceSections = await sourceRef
    .collection('sections')
    .orderBy('sort_order')
    .get()
  for (const section of sourceSections.docs) {
    const itemSnapshots = await section.ref
      .collection('items')
      .orderBy('sort_order')
      .get()
    const items = []
    for (const item of itemSnapshots.docs) {
      const itemData = item.data() || {}
      const dishId = text(itemData.dish_id)
      const dish = dishId
        ? await db.doc(`kitchens/${fixture.kitchenId}/dishes/${dishId}`).get()
        : null
      let kind = text(dish?.get('item_kind')) || text(itemData.item_kind)
      if (!kind && fixture.drinkSections?.includes(section.id)) kind = 'drink'
      if (!kind && fixture.defaultKind) kind = fixture.defaultKind
      if (!kind && fixture.drinkSections) kind = 'food'
      if (kind !== 'food' && kind !== 'drink') {
        throw new Error(`Unclassified item: ${item.ref.path}.`)
      }
      items.push({ id: item.id, data: itemData, kind })
    }
    sections.push({ id: section.id, data: section.data() || {}, items })
  }

  const counts = {
    food: sections.flatMap((section) =>
      section.items.filter((item) => item.kind === 'food')
    ).length,
    drinks: sections.flatMap((section) =>
      section.items.filter((item) => item.kind === 'drink')
    ).length,
  }
  if (!counts.food && !counts.drinks) {
    throw new Error(`Legacy Menu is empty for ${fixture.kitchenSlug}.`)
  }
  const existingCounts = {
    food: await countMenuItems(foodRef),
    drinks: await countMenuItems(drinksRef),
  }
  for (const kind of ['food', 'drinks']) {
    if (existingCounts[kind] !== 0 && existingCounts[kind] !== counts[kind]) {
      throw new Error(
        `Target Menu is partially populated: ${basePath}/${kind}.`
      )
    }
  }
  const newRoots = {}
  for (const kind of ['food', 'drinks']) {
    if (!counts[kind]) continue
    const ref = db.doc(`menus/${rootId(fixture, kind)}`)
    const snapshot = await ref.get()
    if (snapshot.exists) {
      const targetSource = record(snapshot.get('source'))
      if (
        text(targetSource.kitchen_id) !== fixture.kitchenId ||
        text(targetSource.menu_id) !== kind
      ) {
        throw new Error(`Occupied public target: ${ref.path}.`)
      }
    }
    newRoots[kind] = { ref, snapshot }
  }
  migrations.push({
    fixture,
    kitchen,
    source,
    food,
    drinks,
    oldRoot,
    sections,
    counts,
    existingCounts,
    newRoots,
  })
}

const plan = {
  format: 'misebox-menu-system-default-cutover/1',
  projectId: PROJECT_ID,
  databaseId: DATABASE_ID,
  migrations: migrations.map(({ fixture, counts, existingCounts }) => ({
    kitchenId: fixture.kitchenId,
    kitchenSlug: fixture.kitchenSlug,
    sourceMenuId: fixture.sourceMenuId,
    counts,
    existingCounts,
    roots: Object.fromEntries(
      Object.entries(counts)
        .filter(([, count]) => count > 0)
        .map(([kind]) => [kind, rootId(fixture, kind)])
    ),
  })),
}
const planSha256 = sha256(plan)
if (!apply) {
  console.log(
    JSON.stringify({ mode: 'plan', plan_sha256: planSha256, ...plan }, null, 2)
  )
  await deleteApp(app)
  process.exit(0)
}
if (text(args.confirm) !== planSha256) {
  throw new Error(`Apply requires --confirm=${planSha256}.`)
}
const backupPath = text(args.backup)
if (!backupPath.startsWith('/private/tmp/') || !backupPath.endsWith('.json')) {
  throw new Error('Apply requires --backup=/private/tmp/<name>.json.')
}
const backup = await writeProtectedJsonArtifact({
  path: backupPath,
  payload: {
    format: 'misebox-menu-system-default-preimage/1',
    capturedAt: new Date().toISOString(),
    planSha256,
    migrations: migrations.map((migration) => ({
      documents: [
        migration.kitchen,
        migration.source,
        migration.food,
        migration.drinks,
        migration.oldRoot,
        ...Object.values(migration.newRoots).map(({ snapshot }) => snapshot),
      ].map((snapshot) => ({
        path: snapshot.ref.path,
        exists: snapshot.exists,
        data: stable(snapshot.data()),
      })),
      sections: stable(migration.sections),
    })),
  },
})
const now = Timestamp.now()
const rootTarget = target('misebox.menu-system-defaults.root-menus', 'menus', [
  'create',
  'update',
])
const kitchenTarget = target(
  'misebox.menu-system-defaults.kitchens',
  'kitchens',
  ['update']
)

for (const migration of migrations) {
  const {
    fixture,
    sections,
    counts,
    existingCounts,
    source,
    food,
    drinks,
    oldRoot,
  } = migration
  const menusPath = `kitchens/${fixture.kitchenId}/menus`
  const menuTarget = target(
    `misebox.menu-system-defaults.${fixture.kitchenSlug}.menus`,
    menusPath,
    ['update']
  )
  for (const kind of ['food', 'drinks']) {
    if (!counts[kind]) continue
    const menuId = kind
    const current = kind === 'food' ? food : drinks
    await mcpSkillUpdate(app, menuTarget, menuId, {
      ...source.data(),
      kitchen_id: fixture.kitchenId,
      system_kind: kind,
      name: kind === 'food' ? 'Food' : 'Drinks',
      status: 'published',
      sort_order: kind === 'food' ? 10 : 20,
      created: current.get('created'),
      updated: { at: now, by: ACTOR },
    })
    const itemKind = kind === 'drinks' ? 'drink' : 'food'
    for (const section of existingCounts[kind] ? [] : sections) {
      const selected = section.items.filter((item) => item.kind === itemKind)
      if (!selected.length) continue
      const sectionTarget = target(
        `misebox.menu-system-defaults.${fixture.kitchenSlug}.${kind}.${section.id}`,
        `${menusPath}/${menuId}/sections`,
        ['create']
      )
      await mcpSkillCreate(app, sectionTarget, section.id, {
        ...section.data,
        kitchen_id: fixture.kitchenId,
        menu_id: menuId,
        updated: { at: now, by: ACTOR },
      })
      const itemTarget = target(
        `misebox.menu-system-defaults.${fixture.kitchenSlug}.${kind}.${section.id}.items`,
        `${menusPath}/${menuId}/sections/${section.id}/items`,
        ['create']
      )
      for (const item of selected) {
        await mcpSkillCreate(app, itemTarget, item.id, {
          ...item.data,
          kitchen_id: fixture.kitchenId,
          menu_id: menuId,
          section_id: section.id,
          item_kind: item.kind === 'drink' ? 'drink' : 'food',
          updated: { at: now, by: ACTOR },
        })
      }
    }
    const rootPayload = {
      ...oldRoot.data(),
      id: rootId(fixture, kind),
      name: kind === 'food' ? 'Food' : 'Drinks',
      status: 'published',
      source: { ...record(oldRoot.get('source')), menu_id: menuId },
      created: oldRoot.get('created'),
      updated: { at: now, by: ACTOR },
    }
    if (migration.newRoots[kind].snapshot.exists) {
      await mcpSkillUpdate(app, rootTarget, rootId(fixture, kind), rootPayload)
    } else {
      await mcpSkillCreate(app, rootTarget, rootId(fixture, kind), rootPayload)
    }
  }
  await mcpSkillUpdate(app, menuTarget, fixture.sourceMenuId, {
    status: 'archived',
    superseded_by: 'food',
    updated: { at: now, by: ACTOR },
  })
  await mcpSkillUpdate(app, rootTarget, oldRoot.id, {
    status: 'archived',
    superseded_by: rootId(fixture, 'food'),
    updated: { at: now, by: ACTOR },
  })
  await mcpSkillUpdate(app, kitchenTarget, fixture.kitchenId, {
    'menus.primary_menu_id': 'food',
    updated: { at: now, by: ACTOR },
  })
}

for (const migration of migrations) {
  const { fixture, counts } = migration
  for (const kind of ['food', 'drinks']) {
    if (!counts[kind]) continue
    const [menu, root] = await db.getAll(
      db.doc(`kitchens/${fixture.kitchenId}/menus/${kind}`),
      db.doc(`menus/${rootId(fixture, kind)}`)
    )
    if (
      text(menu.get('status')) !== 'published' ||
      text(root.get('status')) !== 'published' ||
      text(root.get('source.menu_id')) !== kind ||
      (await countMenuItems(
        db.doc(`kitchens/${fixture.kitchenId}/menus/${kind}`)
      )) !== counts[kind]
    ) {
      throw new Error(`Verification failed for ${fixture.kitchenSlug} ${kind}.`)
    }
  }
}

console.log(
  JSON.stringify(
    {
      mode: 'apply',
      ok: true,
      plan_sha256: planSha256,
      backup,
      migrations: plan.migrations,
    },
    null,
    2
  )
)
await deleteApp(app)
