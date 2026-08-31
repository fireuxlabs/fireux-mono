#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-08-30
// usage_note: plan or apply deletion of four exact empty Misebox Kitchen/Place test shells and repair AppUser references.

import { createHash } from 'node:crypto'
import { initializeApp, deleteApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { parseArgs } from './_lib/args.mjs'
import { resolveFirebaseAdminCredential } from './_lib/firebase-admin-credentials.mjs'
import { mcpSkillDelete } from './_lib/firestore-mutations/mcp-skill-delete.mjs'
import { mcpSkillUpdate } from './_lib/firestore-mutations/mcp-skill-update.mjs'
import { writeProtectedJsonArtifact } from './_lib/protected-json-artifact.mjs'
import { defineFirestoreMutationTarget } from '../packages/core/fireux-core/src/runtime/utils/firestore-mutations/target-definition.ts'

const PROJECT_ID = 'misebox-78f9c'
const DATABASE_ID = 'misebox'
const APP_ID = 'misebox-app'
const CANDIDATES = [
  { id: '7jLGMO9bdOllsVhwQZQz', name: 'Test', slug: 'test' },
  { id: 'UoJBEwfwDuQJo007J8jq3nBwcCD2', name: 'i am', slug: 'k' },
  { id: 'Khq6IwP0Q3MOXCrQVcxZw5IjCxs1', name: 'pancake', slug: 'p' },
  {
    id: '7e8vbFxGNjgoWgjCOhvNxup2FTo2',
    name: 'Firebase Kitchen',
    slug: 'firebase-kitchen',
  },
]
const OPERATIONAL_COLLECTIONS = [
  'dishes',
  'ingredients',
  'menus',
  'orders',
  'prep-items',
  'recipes',
  'service-sessions',
  'suppliers',
]

const args = parseArgs(process.argv.slice(2))
const apply = args.apply === true
const text = (value) => String(value ?? '').trim()
const stable = (value) => {
  if (value == null || typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map(stable)
  if (typeof value.toDate === 'function')
    return { __timestamp: value.toDate().toISOString() }
  return Object.fromEntries(
    Object.entries(value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, child]) => [key, stable(child)])
  )
}
const sha256 = (value) =>
  createHash('sha256')
    .update(JSON.stringify(stable(value)))
    .digest('hex')

const auth = await resolveFirebaseAdminCredential({
  args,
  scope: 'misebox',
  projectId: PROJECT_ID,
})
const app = initializeApp(
  { credential: auth.credential, projectId: PROJECT_ID },
  `delete-misebox-junk-kitchen-shells-${Date.now()}`
)

try {
  const db = getFirestore(app, DATABASE_ID)
  const appUsersRef = db.collection('apps').doc(APP_ID).collection('users')
  const appUsers = await appUsersRef.get()
  const operations = []
  const documents = []

  for (const candidate of CANDIDATES) {
    const kitchenRef = db.collection('kitchens').doc(candidate.id)
    const placeRef = db.collection('places').doc(candidate.id)
    const [kitchenSnapshot, placeSnapshot, teamSnapshot] = await Promise.all([
      kitchenRef.get(),
      placeRef.get(),
      kitchenRef.collection('team').get(),
    ])
    if (!kitchenSnapshot.exists || !placeSnapshot.exists)
      throw new Error(`Missing exact Kitchen/Place pair: ${candidate.id}`)
    const place = placeSnapshot.data() || {}
    if (
      text(place.name) !== candidate.name ||
      text(place.slug) !== candidate.slug
    )
      throw new Error(
        `Unexpected Place identity for ${candidate.id}: ${JSON.stringify({ name: text(place.name), slug: text(place.slug) })}`
      )
    if (teamSnapshot.size !== 1)
      throw new Error(`Expected exactly one Team shell for ${candidate.id}`)
    for (const collection of OPERATIONAL_COLLECTIONS) {
      const snapshot = await kitchenRef.collection(collection).limit(1).get()
      if (!snapshot.empty)
        throw new Error(
          `${candidate.name} has operational data in ${collection}`
        )
    }
    const refs = appUsers.docs
      .filter((doc) => {
        const data = doc.data() || {}
        return (
          (Array.isArray(data.kitchens) &&
            data.kitchens.includes(candidate.id)) ||
          text(data.primary_kitchen) === candidate.id
        )
      })
      .map((doc) => {
        const data = doc.data() || {}
        const kitchens = (
          Array.isArray(data.kitchens) ? data.kitchens : []
        ).filter((id) => text(id) && text(id) !== candidate.id)
        const primary = text(data.primary_kitchen)
        return {
          uid: doc.id,
          source_sha256: sha256(data),
          kitchens,
          primary_kitchen:
            primary === candidate.id ? kitchens[0] || '' : primary,
        }
      })
    operations.push({
      ...candidate,
      kitchen_source_sha256: sha256(kitchenSnapshot.data()),
      place_source_sha256: sha256(place),
      team: teamSnapshot.docs.map((doc) => ({
        id: doc.id,
        source_sha256: sha256(doc.data()),
      })),
      app_users: refs,
    })
    documents.push(
      { path: kitchenRef.path, data: stable(kitchenSnapshot.data()) },
      { path: placeRef.path, data: stable(place) },
      ...teamSnapshot.docs.map((doc) => ({
        path: doc.ref.path,
        data: stable(doc.data()),
      })),
      ...refs.map((ref) => {
        const doc = appUsers.docs.find(
          (candidateDoc) => candidateDoc.id === ref.uid
        )
        return { path: doc.ref.path, data: stable(doc.data()) }
      })
    )
  }

  const plan = {
    format: 'fireux-junk-kitchen-shell-cleanup-plan/1',
    project_id: PROJECT_ID,
    database_id: DATABASE_ID,
    operations,
  }
  const planSha256 = sha256(plan)
  if (!apply) {
    console.log(
      JSON.stringify(
        { mode: 'plan', plan_sha256: planSha256, ...plan },
        null,
        2
      )
    )
    process.exitCode = 0
  } else {
    if (text(args.confirm) !== planSha256)
      throw new Error(`Apply requires --confirm ${planSha256}`)
    const backupPath = text(args.backup)
    if (
      !backupPath.startsWith('/private/tmp/') ||
      !backupPath.endsWith('.json')
    )
      throw new Error('Apply requires --backup /private/tmp/<name>.json')
    for (const operation of operations) {
      const [kitchen, place] = await Promise.all([
        db.collection('kitchens').doc(operation.id).get(),
        db.collection('places').doc(operation.id).get(),
      ])
      if (
        !kitchen.exists ||
        sha256(kitchen.data()) !== operation.kitchen_source_sha256 ||
        !place.exists ||
        sha256(place.data()) !== operation.place_source_sha256
      )
        throw new Error(`${operation.name} changed after planning.`)
      for (const ref of operation.app_users) {
        const user = await appUsersRef.doc(ref.uid).get()
        if (!user.exists || sha256(user.data()) !== ref.source_sha256)
          throw new Error(`AppUser ${ref.uid} changed after planning.`)
      }
    }
    const backup = await writeProtectedJsonArtifact({
      path: backupPath,
      payload: {
        format: 'fireux-junk-kitchen-shell-cleanup-preimage/1',
        captured_at: new Date().toISOString(),
        plan_sha256: planSha256,
        documents,
      },
    })
    const appUserTarget = defineFirestoreMutationTarget({
      key: 'misebox.junk-kitchen-cleanup.app-users',
      lane: 'mcp-skill',
      verbs: ['update'],
      database: { kind: 'named', databaseId: DATABASE_ID },
      collectionPath: `apps/${APP_ID}/users`,
    })
    for (const operation of operations)
      for (const ref of operation.app_users)
        await mcpSkillUpdate(app, appUserTarget, ref.uid, {
          kitchens: ref.kitchens,
          primary_kitchen: ref.primary_kitchen,
        })
    for (const operation of operations) {
      const teamTarget = defineFirestoreMutationTarget({
        key: `misebox.junk-kitchen-cleanup.${operation.id}.team`,
        lane: 'mcp-skill',
        verbs: ['delete'],
        database: { kind: 'named', databaseId: DATABASE_ID },
        collectionPath: `kitchens/${operation.id}/team`,
      })
      for (const member of operation.team)
        await mcpSkillDelete(app, teamTarget, member.id)
    }
    const kitchenTarget = defineFirestoreMutationTarget({
      key: 'misebox.junk-kitchen-cleanup.kitchens',
      lane: 'mcp-skill',
      verbs: ['delete'],
      database: { kind: 'named', databaseId: DATABASE_ID },
      collectionPath: 'kitchens',
    })
    const placeTarget = defineFirestoreMutationTarget({
      key: 'misebox.junk-kitchen-cleanup.places',
      lane: 'mcp-skill',
      verbs: ['delete'],
      database: { kind: 'named', databaseId: DATABASE_ID },
      collectionPath: 'places',
    })
    for (const operation of operations) {
      await mcpSkillDelete(app, kitchenTarget, operation.id)
      await mcpSkillDelete(app, placeTarget, operation.id)
    }
    for (const operation of operations) {
      const [kitchen, place, team] = await Promise.all([
        db.collection('kitchens').doc(operation.id).get(),
        db.collection('places').doc(operation.id).get(),
        db.collection('kitchens').doc(operation.id).collection('team').get(),
      ])
      if (kitchen.exists || place.exists || !team.empty)
        throw new Error(`Post-delete verification failed for ${operation.name}`)
      for (const ref of operation.app_users) {
        const user = (await appUsersRef.doc(ref.uid).get()).data() || {}
        if (
          JSON.stringify(user.kitchens || []) !==
            JSON.stringify(ref.kitchens) ||
          text(user.primary_kitchen) !== ref.primary_kitchen
        )
          throw new Error(
            `Post-update AppUser verification failed for ${ref.uid}`
          )
      }
    }
    console.log(
      JSON.stringify(
        {
          mode: 'apply',
          ok: true,
          plan_sha256: planSha256,
          backup: backup.path,
          deleted: operations.map(({ id, name }) => ({ id, name })),
          repaired_app_users: [
            ...new Set(
              operations.flatMap((operation) =>
                operation.app_users.map(({ uid }) => uid)
              )
            ),
          ],
        },
        null,
        2
      )
    )
  }
} finally {
  await deleteApp(app)
}
