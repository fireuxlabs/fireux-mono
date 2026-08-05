import type { Firestore } from 'firebase-admin/firestore'
import type { PlatformDirectoryResponse } from 'fireux-core/runtime/models/utils/directory'
import {
  projectPublicApp,
  toAppDirectoryEntry,
} from 'fireux-core/runtime/server/utils/public-projection/public-app.dto'
import { projectEcosystemDirectoryEntry } from 'fireux-core/runtime/server/utils/public-projection/public-ecosystem.dto'
export {
  isDirectoryAppIndexable,
  isDirectoryEcosystemIndexable,
} from '../../app/utils/directorySearchPolicy'
import { getFirestoreDb } from './firebase-admin'

type StoredDocument = Record<string, unknown> & { id: string }

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

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

export async function readPlatformDirectory(): Promise<PlatformDirectoryResponse> {
  const db = await getFirestoreDb('(default)')
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

  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    apps,
    ecosystems,
  }
}
