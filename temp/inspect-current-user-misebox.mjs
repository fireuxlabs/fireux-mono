#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { FieldPath, getFirestore } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'

const UID = 'jMK33p5XlhYS8rBCEf8qUiogfMg2'
const SERVICE_ACCOUNT =
  'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json'
const PROJECT_ID = 'misebox-78f9c'
const DATABASE_ID = 'misebox'

const raw = await readFile(SERVICE_ACCOUNT, 'utf8')
const app = initializeApp({
  credential: cert(JSON.parse(raw)),
  projectId: PROJECT_ID,
})
const db = getFirestore(app, DATABASE_ID)

const text = (value) => String(value ?? '').trim()
const strings = (value) =>
  Array.isArray(value) ? value.map(text).filter(Boolean) : []

function clean(value) {
  if (value == null) return value
  if (Array.isArray(value)) return value.map(clean)
  if (typeof value !== 'object') return value
  if (typeof value.toDate === 'function') {
    return { seconds: value.seconds, nanoseconds: value.nanoseconds }
  }
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [key, clean(entry)])
  )
}

function appSummary(doc) {
  const data = doc.data() || {}
  return {
    id: doc.id,
    name: text(data.name || data.app_name),
    slug: text(data.slug),
    role: text(data.role),
    status: text(data.status),
    ecosystem_id: text(data.ecosystem_id),
    project_id: text(data.project_id),
    app_scope_state: text(data.app_scope_state),
    admin_ids: strings(data.admin_ids),
    join_requests: strings(data.join_requests),
    derived: clean(data.derived || {}),
  }
}

function kitchenSummary(doc, source) {
  const data = doc.data() || {}
  return {
    id: doc.id,
    source,
    name: text(data.name || data.display_name || data.short_name),
    slug: text(data.slug),
    app_id: text(data.app_id),
    app_scope_app_id: text(data.app_scope_app_id),
    app_scope_state: text(data.app_scope_state),
    status: text(data.status || data.active),
    team_ids: strings(data.team_ids),
    operator_ids: strings(data.operator_ids),
    join_requests: strings(data.join_requests),
    hasStyle: Boolean(data.style && typeof data.style === 'object'),
  }
}

async function byArrayContains(collectionPath, field) {
  const snap = await db.collection(collectionPath).where(field, 'array-contains', UID).get()
  return snap.docs
}

async function docsByIds(collectionPath, ids) {
  const unique = [...new Set(ids.map(text).filter(Boolean))]
  const docs = []

  for (let i = 0; i < unique.length; i += 10) {
    const chunk = unique.slice(i, i + 10)
    const snap = await db
      .collection(collectionPath)
      .where(FieldPath.documentId(), 'in', chunk)
      .get()
    docs.push(...snap.docs)
  }

  return docs
}

async function appMembershipFor(appId) {
  const snap = await db.collection('apps').doc(appId).collection('users').doc(UID).get()
  return snap.exists
    ? {
        appId,
        exists: true,
        data: clean(snap.data() || {}),
      }
    : { appId, exists: false }
}

const userSnap = await db.collection('users').doc(UID).get()
const user = userSnap.exists ? clean(userSnap.data() || {}) : null
const userKitchenIds = strings(user?.myKitchens)

const appsSnap = await db.collection('apps').orderBy(FieldPath.documentId()).get()
const apps = appsSnap.docs.map(appSummary)
const appMemberships = await Promise.all(apps.map((entry) => appMembershipFor(entry.id)))

const kitchenDocsById = await docsByIds('kitchens', userKitchenIds)
const kitchenTeamDocs = await byArrayContains('kitchens', 'team_ids')
const kitchenOperatorDocs = await byArrayContains('kitchens', 'operator_ids')

const rootKitchenMap = new Map()
for (const doc of [...kitchenDocsById, ...kitchenTeamDocs, ...kitchenOperatorDocs]) {
  rootKitchenMap.set(doc.id, doc)
}

const appScopedKitchens = []
for (const appEntry of apps) {
  const collection = db.collection('apps').doc(appEntry.id).collection('kitchens')
  const [byId, byTeam, byOperator] = await Promise.all([
    docsByIds(`apps/${appEntry.id}/kitchens`, userKitchenIds),
    collection.where('team_ids', 'array-contains', UID).get().then((snap) => snap.docs),
    collection.where('operator_ids', 'array-contains', UID).get().then((snap) => snap.docs),
  ])

  for (const doc of [...byId, ...byTeam, ...byOperator]) {
    appScopedKitchens.push(kitchenSummary(doc, `apps/${appEntry.id}/kitchens`))
  }
}

const rootKitchens = [...rootKitchenMap.values()].map((doc) =>
  kitchenSummary(doc, 'kitchens')
)

console.log(
  JSON.stringify(
    {
      projectId: PROJECT_ID,
      databaseId: DATABASE_ID,
      uid: UID,
      user: user
        ? {
            id: UID,
            display_name: text(user.display_name),
            handle: text(user.handle),
            email: text(user.email),
            profiles: strings(user.profiles),
            userOf: strings(user.userOf),
            adminOf: strings(user.adminOf),
            myKitchens: userKitchenIds,
          }
        : null,
      apps,
      appMemberships,
      kitchens: {
        root: rootKitchens,
        appScoped: appScopedKitchens,
      },
      counts: {
        apps: apps.length,
        memberships: appMemberships.filter((entry) => entry.exists).length,
        userMyKitchenIds: userKitchenIds.length,
        rootKitchens: rootKitchens.length,
        appScopedKitchens: appScopedKitchens.length,
      },
    },
    null,
    2
  )
)
