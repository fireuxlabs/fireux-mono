import type { Firestore } from 'firebase-admin/firestore'
import type { PlatformDirectoryResponse } from 'fireux-core/runtime/models/utils/directory'
import {
  projectAppDetail,
  toAppDirectoryEntry,
} from 'fireux-core/runtime/app/server/index/projection'
import { projectEcosystemDirectoryEntry } from 'fireux-core/runtime/ecosystem/server/directory/projection'
import {
  PLATFORM_DIRECTORY_TARGETS,
  type PlatformDirectoryTarget,
} from '../config/platform-directory-targets'
export {
  isDirectoryAppIndexable,
  isDirectoryEcosystemIndexable,
} from '../../app/utils/directorySearchPolicy'
import { getFirestoreProjectDb } from './firebase-admin'

type StoredDocument = Record<string, unknown> & { id: string }

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

async function fetchCollection(
  db: Firestore,
  collectionPath: string
): Promise<StoredDocument[]> {
  const snapshot = await db.collection(collectionPath).get()
  return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
}

async function readTarget(target: PlatformDirectoryTarget) {
  try {
    const db = await getFirestoreProjectDb(target.projectId)
    const [ecosystem, apps] = await Promise.all([
      db.collection('ecosystem').doc(target.ecosystemId).get(),
      fetchCollection(db, 'apps'),
    ])
    if (!ecosystem.exists) {
      throw new Error(
        `Missing EcosystemMeta: ${target.projectId}/ecosystem/${target.ecosystemId}`
      )
    }
    return {
      target,
      ecosystem: { ...ecosystem.data(), id: ecosystem.id } as StoredDocument,
      apps,
    }
  } catch (error) {
    throw new Error(
      `Platform directory target failed: ${target.projectId}/${target.ecosystemId}`,
      { cause: error }
    )
  }
}

function uniqueDocuments(
  documents: readonly StoredDocument[],
  family: string
): StoredDocument[] {
  const byId = new Map<string, StoredDocument>()
  for (const document of documents) {
    if (byId.has(document.id)) {
      throw new Error(
        `Duplicate ${family} id in platform directory: ${document.id}`
      )
    }
    byId.set(document.id, document)
  }
  return [...byId.values()]
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
  const directories = await Promise.all(
    PLATFORM_DIRECTORY_TARGETS.map((target) => readTarget(target))
  )
  const rawApps = uniqueDocuments(
    directories.flatMap((directory) => directory.apps),
    'App'
  )
  const activeApps = rawApps.filter((raw) => text(raw.status) === 'active')
  const appCounts = new Map<string, number>()
  for (const raw of activeApps) {
    const ecosystemId = text(raw.ecosystem_id)
    if (!ecosystemId) continue
    appCounts.set(ecosystemId, (appCounts.get(ecosystemId) || 0) + 1)
  }

  const apps = activeApps
    .map((raw) => {
      const projected = projectAppDetail(raw, { id: raw.id })
      return projected
        ? { entry: toAppDirectoryEntry(projected), order: launchOrder(raw) }
        : null
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row))
    .sort(
      (a, b) =>
        a.order - b.order || a.entry.name.localeCompare(b.entry.name)
    )
    .map(({ entry }) => entry)

  const ecosystems = directories
    .filter(({ ecosystem }) => text(ecosystem.status) === 'active')
    .map(({ ecosystem, target }) => {
      const entry = projectEcosystemDirectoryEntry(ecosystem, {
        id: ecosystem.id,
        appCount: appCounts.get(ecosystem.id) || 0,
      })
      return entry && target.detailPath
        ? { ...entry, detail_url: target.detailPath }
        : entry
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row))
    .sort((a, b) => a.name.localeCompare(b.name))

  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    apps,
    ecosystems,
  }
}
