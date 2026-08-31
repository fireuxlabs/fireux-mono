#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-08-22
// usage_note: read-only registry-wide audit of canonical User identity and AppUser membership shapes.

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { deleteApp, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { APP_REGISTRY } from './_lib/app-registry.mjs'
import { resolveFirebaseAdminCredential } from './_lib/firebase-admin-credentials.mjs'

const USER_FIELDS = ['avatar', 'bio', 'display_name', 'handle']
const REQUIRED_APP_USER_FIELDS = [
  'created',
  'onboarding_status',
  'role',
  'subscription',
  'updated',
]
const APP_USER_RELATIONSHIPS = [
  ['kitchens', 'primary_kitchen'],
  ['projects', 'primary_project'],
  ['properties', 'primary_property'],
  ['portfolios', 'primary_portfolio'],
  ['suppliers', 'primary_supplier'],
  ['blanks', 'primary_blank'],
]
const APP_USER_FIELDS = [
  ...REQUIRED_APP_USER_FIELDS,
  ...APP_USER_RELATIONSHIPS.flat(),
]

const text = (value) => String(value ?? '').trim()
const literal = (source, key) =>
  text(
    source.match(new RegExp(`\\b${key}\\s*:\\s*'([^']*)'`))?.[1] ||
      source.match(new RegExp(`\\b${key}\\s*:\\s*"([^"]*)"`))?.[1]
  )

function ecosystemTargets() {
  const targets = new Map()
  for (const app of Object.values(APP_REGISTRY)) {
    const key = text(app.ecosystem)
    if (!key) continue
    if (!targets.has(key)) {
      const configPath = path.resolve(
        'packages',
        'ecosystem',
        `fireux-${key}`,
        'src/config/firebase/ecosystem.config.ts'
      )
      const source = readFileSync(configPath, 'utf8')
      targets.set(key, {
        ecosystem: key,
        projectId: literal(source, 'projectId'),
        databaseId: literal(source, 'databaseId'),
        apps: [],
      })
    }
    const envPath = path.resolve(app.workspace, '.env')
    let developerId = ''
    try {
      const env = readFileSync(envPath, 'utf8')
      developerId = text(env.match(/^DEVELOPER_(?:ID|UID)=(.+)$/m)?.[1]).replace(
        /^['"]|['"]$/g,
        ''
      )
    } catch {}
    targets.get(key).apps.push({
      key: app.key,
      appId: app.appId,
      databaseId: app.databaseId,
      developerId,
    })
  }
  return [...targets.values()].sort((a, b) =>
    a.ecosystem.localeCompare(b.ecosystem)
  )
}

function extraFields(value, allowed) {
  return Object.keys(value).filter((key) => !allowed.includes(key)).sort()
}

function relationshipIssues(value) {
  return APP_USER_RELATIONSHIPS.flatMap(([idsField, primaryField]) => {
    const hasIds = Object.hasOwn(value, idsField)
    const hasPrimary = Object.hasOwn(value, primaryField)
    if (hasIds !== hasPrimary) return [`${idsField}:incomplete`]
    if (!hasIds) return []
    const ids = value[idsField]
    if (
      !Array.isArray(ids) ||
      ids.length > 500 ||
      ids.some(
        (entry) =>
          typeof entry !== 'string' ||
          entry !== entry.trim() ||
          !entry ||
          entry.includes('/')
      ) ||
      new Set(ids).size !== ids.length
    ) {
      return [`${idsField}:invalid`]
    }
    const primary = value[primaryField]
    return typeof primary !== 'string' ||
      primary !== primary.trim() ||
      primary.includes('/') ||
      (primary !== '' && !ids.includes(primary))
      ? [`${primaryField}:invalid`]
      : []
  })
}

const sessions = []
try {
  const report = { targets: [], users: [], apps: [] }
  for (const target of ecosystemTargets()) {
    const resolved = await resolveFirebaseAdminCredential({
      scope: target.ecosystem,
      projectId: target.projectId,
    })
    const app = initializeApp(
      { credential: resolved.credential, projectId: target.projectId },
      `audit-user-app-user-${target.ecosystem}-${Date.now()}`
    )
    sessions.push(app)
    report.targets.push({
      ecosystem: target.ecosystem,
      projectId: target.projectId,
      databaseId: target.databaseId,
    })

    const identityDb = getFirestore(app, target.databaseId)
    const userSnapshot = await identityDb.collection('users').get()
    const userRows = userSnapshot.docs.map((document) => {
      const value = document.data()
      return {
        id: document.id,
        missing: USER_FIELDS.filter((field) => typeof value[field] !== 'string'),
        extra: extraFields(value, USER_FIELDS),
      }
    })
    report.users.push({
      ecosystem: target.ecosystem,
      count: userRows.length,
      invalid: userRows.filter((row) => row.missing.length || row.extra.length),
    })

    for (const appTarget of target.apps) {
      const db = getFirestore(app, appTarget.databaseId)
      const snapshot = await db
        .collection('apps')
        .doc(appTarget.appId)
        .collection('users')
        .get()
      const memberships = snapshot.docs.map((document) => {
        const value = document.data()
        return {
          id: document.id,
          role: value.role ?? null,
          subscription: value.subscription ?? null,
          onboarding_status: value.onboarding_status ?? null,
          missing: REQUIRED_APP_USER_FIELDS.filter(
            (field) => !Object.hasOwn(value, field)
          ),
          configuredDeveloper: Boolean(appTarget.developerId) &&
            document.id === appTarget.developerId,
          fields: Object.keys(value).sort(),
          extra: extraFields(value, APP_USER_FIELDS),
          invalidRelationships: relationshipIssues(value),
        }
      })
      report.apps.push({
        ecosystem: target.ecosystem,
        projectId: target.projectId,
        databaseId: appTarget.databaseId,
        app: appTarget.key,
        appId: appTarget.appId,
        developerId: appTarget.developerId || null,
        count: memberships.length,
        memberships,
      })
    }
  }
  console.log(JSON.stringify(report, null, 2))
} finally {
  await Promise.all(sessions.map((app) => deleteApp(app)))
}
