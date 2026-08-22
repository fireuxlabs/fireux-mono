import type { PlatformDirectoryResponse } from 'fireux-core/runtime/models/utils/directory'
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
import { readPlatformApps } from './apps'

type StoredDocument = Record<string, unknown> & { id: string }

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

async function readTarget(target: PlatformDirectoryTarget) {
  try {
    const defaultDb = await getFirestoreProjectDb(target.projectId)
    const ecosystem = await defaultDb
      .collection('ecosystem')
      .doc(target.ecosystemId)
      .get()
    if (!ecosystem.exists) {
      throw new Error(
        `Missing EcosystemMeta: ${target.projectId}/ecosystem/${target.ecosystemId}`
      )
    }
    return {
      target,
      ecosystem: { ...ecosystem.data(), id: ecosystem.id } as StoredDocument,
    }
  } catch (error) {
    throw new Error(
      `Platform directory target failed: ${target.projectId}/${target.ecosystemId}`,
      { cause: error }
    )
  }
}

export async function readPlatformDirectory(): Promise<PlatformDirectoryResponse> {
  const directories = await Promise.all(
    PLATFORM_DIRECTORY_TARGETS.map((target) => readTarget(target))
  )
  const rawApps = await readPlatformApps()
  const appCounts = new Map<string, number>()
  for (const raw of rawApps) {
    const ecosystemId = text(raw.ecosystem_id)
    if (!ecosystemId) continue
    appCounts.set(ecosystemId, (appCounts.get(ecosystemId) || 0) + 1)
  }

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
    ecosystems,
  }
}
