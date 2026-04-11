#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'

const APP_TARGETS = [
  {
    ecosystem: 'fireux',
    databaseId: 'fireux',
    serviceAccountPath: 'packages/ecosystem/fireux-fireux/src/config/firebase/service-account.json',
  },
  {
    ecosystem: 'misebox',
    databaseId: 'misebox',
    serviceAccountPath: 'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json',
  },
  {
    ecosystem: 'cleanbox',
    databaseId: 'cleanbox',
    serviceAccountPath: 'packages/ecosystem/fireux-cleanbox/src/config/firebase/service-account.json',
  },
  {
    ecosystem: 'granite',
    databaseId: 'granite',
    serviceAccountPath: 'packages/ecosystem/fireux-granite/src/config/firebase/service-account.json',
  },
  {
    ecosystem: 'bringli',
    databaseId: 'bringli',
    serviceAccountPath: 'packages/ecosystem/fireux-bringli/src/config/firebase/service-account.json',
  },
]

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : String(value || '').trim()
}

function firstString(record, keys) {
  for (const key of keys) {
    const value = normalizeString(record?.[key])
    if (value) return value
  }
  return ''
}

function readNestedString(record, paths) {
  for (const path of paths) {
    let current = record
    for (const segment of path) {
      if (!current || typeof current !== 'object' || Array.isArray(current)) {
        current = ''
        break
      }
      current = current[segment]
    }

    const value = normalizeString(current)
    if (value) return value
  }

  return ''
}

function toStringArray(value) {
  if (!Array.isArray(value)) return []
  return value.map((entry) => normalizeString(entry)).filter(Boolean)
}

function normalizeRole(value, fallback = 'tenant') {
  const role = normalizeString(value)
  if (
    role === 'global' ||
    role === 'tenant' ||
    role === 'standalone' ||
    role === 'ecosystem' ||
    role === 'system'
  ) {
    return role
  }
  return fallback
}

function normalizeStatus(value) {
  const status = normalizeString(value)
  if (
    status === 'draft' ||
    status === 'active' ||
    status === 'paused' ||
    status === 'archived'
  ) {
    return status
  }
  return 'active'
}

function socialLinksFrom(data) {
  const existing = data?.social_links && typeof data.social_links === 'object'
    ? data.social_links
    : {}

  return {
    website:
      firstString(data, ['source_url', 'site_url', 'app_url', 'url']) ||
      readNestedString(data, [['social_links', 'website']]),
    twitter: normalizeString(existing.twitter),
    github: normalizeString(existing.github),
    linkedin: normalizeString(existing.linkedin),
    instagram: normalizeString(existing.instagram),
    facebook: normalizeString(existing.facebook),
    youtube: normalizeString(existing.youtube),
    email: normalizeString(existing.email),
  }
}

function mediaFrom(data) {
  return {
    thumbnail_url:
      readNestedString(data, [['media', 'thumbnail_url']]) ||
      firstString(data, ['thumbnail_url']),
    logo_url:
      readNestedString(data, [['media', 'logo_url']]) ||
      firstString(data, ['logo_url', 'image_url']),
    wordmark_light_url:
      readNestedString(data, [['media', 'wordmark_light_url']]) ||
      firstString(data, ['wordmark_light_url']),
    wordmark_dark_url:
      readNestedString(data, [['media', 'wordmark_dark_url']]) ||
      firstString(data, ['wordmark_dark_url']),
    cover_url:
      readNestedString(data, [['media', 'cover_url']]) ||
      firstString(data, ['cover_url']),
  }
}

function appPayloadFrom({ id, data, ecosystem, mainAppId }) {
  const roleFallback = id === mainAppId ? 'global' : 'tenant'

  return {
    id,
    project_id: ecosystem,
    ecosystem_id: ecosystem,
    slug: firstString(data, ['slug']) || id,
    status: normalizeStatus(data.status),
    team: firstString(data, ['team']),
    app_name: firstString(data, ['app_name', 'name', 'app_short_name']) || id,
    app_short_name: firstString(data, ['app_short_name', 'app_name', 'name']) || id,
    role: normalizeRole(data.role, roleFallback),
    ecosystem: firstString(data, ['ecosystem']) || ecosystem,
    tagline: firstString(data, ['tagline']),
    description: firstString(data, ['description']),
    short_bio: firstString(data, ['short_bio']),
    long_bio: firstString(data, ['long_bio']),
    social_links: socialLinksFrom(data),
    derived: {
      user_count:
        typeof data?.derived?.user_count === 'number' ? data.derived.user_count : 0,
    },
    media: mediaFrom(data),
    join_requests: toStringArray(data.join_requests),
    admin_ids: toStringArray(data.admin_ids),
    moderation_state: firstString(data, ['moderation_state']),
    ban_reasons: toStringArray(data.ban_reasons),
    console_enabled:
      typeof data.console_enabled === 'boolean' ? data.console_enabled : true,
    created:
      data.created && typeof data.created === 'object'
        ? data.created
        : {
            at: FieldValue.serverTimestamp(),
            by: id,
            app_id: id,
          },
    updated:
      data.updated && typeof data.updated === 'object'
        ? data.updated
        : {
            at: FieldValue.serverTimestamp(),
            by: id,
          },
  }
}

for (const target of APP_TARGETS) {
  const rawServiceAccount = await readFile(target.serviceAccountPath, 'utf8')
  const serviceAccount = JSON.parse(rawServiceAccount)
  const projectId = normalizeString(serviceAccount.project_id)
  const appName = `backfill-default-apps-${projectId}`
  const adminApp = initializeApp(
    {
      credential: cert(serviceAccount),
      projectId,
    },
    appName
  )

  const defaultDb = getFirestore(adminApp)
  const namedDb = getFirestore(adminApp, target.databaseId)
  const controlSnap = await defaultDb.collection('project').doc(projectId).get()
  const mainAppId = normalizeString(controlSnap.data()?.main_app_id)
  const appsSnap = await namedDb.collection('apps').get()

  let synced = 0

  for (const appDoc of appsSnap.docs) {
    const payload = appPayloadFrom({
      id: appDoc.id,
      data: appDoc.data() || {},
      ecosystem: target.ecosystem,
      mainAppId,
    })

    await defaultDb.collection('apps').doc(appDoc.id).set(payload, { merge: true })
    synced += 1
  }

  console.log(
    JSON.stringify({
      projectId,
      databaseId: target.databaseId,
      defaultDatabaseId: '(default)',
      synced,
    })
  )
}
