// Concurrent edit — 2026-07-20 16:00 CEST — FireUX dev recovery: resolve cross-package server imports explicitly.
import {
  createError,
  defineEventHandler,
  setResponseHeaders,
  type H3Event,
} from 'h3'
import type { Firestore } from 'firebase-admin/firestore'
import type { PlatformDirectoryResponse } from 'fireux-core/runtime/models/utils/directory.ts'
import {
  projectPublicApp,
  toAppDirectoryEntry,
} from 'fireux-core/runtime/server/utils/public-projection/public-app.dto.ts'
import { projectEcosystemDirectoryEntry } from 'fireux-core/runtime/server/utils/public-projection/public-ecosystem.dto.ts'
import { getFirestoreDb } from '../../utils/firebase-admin'

type StoredDocument = Record<string, unknown> & { id: string }

const text = (value: unknown) =>
  typeof value === 'string' ? value.trim() : ''

async function fetchCollection(
  db: Firestore,
  collectionPath: string
): Promise<StoredDocument[]> {
  const snapshot = await db.collection(collectionPath).get()
  return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
}

const launchOrder = (raw: StoredDocument) => {
  const repo =
    raw.fireux_repo && typeof raw.fireux_repo === 'object'
      ? (raw.fireux_repo as Record<string, unknown>)
      : {}
  const value = Number(repo.launch_order)
  return Number.isFinite(value) ? value : 0
}

export default defineEventHandler(async (event: H3Event) => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control':
      'public, max-age=120, s-maxage=600, stale-while-revalidate=3600',
  })

  try {
    const db = await getFirestoreDb()
    const [rawApps, rawEcosystems] = await Promise.all([
      fetchCollection(db, 'apps'),
      fetchCollection(db, 'ecosystems'),
    ])

    const activeApps = rawApps.filter((raw) => text(raw.status) === 'active')
    const appCounts = new Map<string, number>()
    for (const raw of activeApps) {
      const ecosystemId = text(raw.ecosystem_id)
      if (!ecosystemId) continue
      appCounts.set(ecosystemId, (appCounts.get(ecosystemId) || 0) + 1)
    }

    const apps = activeApps
      .map((raw) => {
        const projected = projectPublicApp(raw, { id: raw.id })
        return projected
          ? { entry: toAppDirectoryEntry(projected), order: launchOrder(raw) }
          : null
      })
      .filter((row): row is NonNullable<typeof row> => Boolean(row))
      .sort(
        (a, b) =>
          a.order - b.order || a.entry.app_name.localeCompare(b.entry.app_name)
      )
      .map(({ entry }) => entry)

    const ecosystems = rawEcosystems
      .filter((raw) => text(raw.status) === 'active')
      .map((raw) =>
        projectEcosystemDirectoryEntry(raw, {
          id: raw.id,
          appCount: appCounts.get(raw.id) || 0,
        })
      )
      .filter((row): row is NonNullable<typeof row> => Boolean(row))
      .sort((a, b) => a.name.localeCompare(b.name))

    const response: PlatformDirectoryResponse = {
      ok: true,
      generatedAt: new Date().toISOString(),
      apps,
      ecosystems,
    }

    return response
  } catch {
    throw createError({
      statusCode: 503,
      statusMessage: 'Platform directory is temporarily unavailable.',
    })
  }
})
