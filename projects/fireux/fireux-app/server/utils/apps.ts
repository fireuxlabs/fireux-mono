import type { App } from 'fireux-core/runtime/app/models/app.model'
import { readAppDocument } from 'fireux-core/runtime/app/utils/readApp'
import { PLATFORM_DIRECTORY_TARGETS } from '../config/platform-directory-targets'
import { getFirestoreProjectDb } from './firebase-admin'

/** Fetch every canonical App document across configured ecosystem databases. */
export async function readPlatformApps(): Promise<App[]> {
  const collections = await Promise.all(
    PLATFORM_DIRECTORY_TARGETS.map(async (target) => {
      const db = await getFirestoreProjectDb(target.projectId, target.databaseId)
      const snapshot = await db.collection('apps').get()
      return snapshot.docs.map(
        (document) => ({ ...document.data(), id: document.id }) as App
      )
    })
  )
  const apps = collections.flat()
  const ids = new Set<string>()
  for (const app of apps) {
    if (ids.has(app.id)) throw new Error(`Duplicate canonical App id: ${app.id}`)
    ids.add(app.id)
  }
  return apps.sort((left, right) => left.id.localeCompare(right.id))
}

export async function readPlatformApp(appId: string): Promise<App | null> {
  const id = String(appId || '').trim()
  if (!id || id.includes('/')) return null
  const matches = await Promise.all(
    PLATFORM_DIRECTORY_TARGETS.map(async (target) => {
      const db = await getFirestoreProjectDb(target.projectId, target.databaseId)
      const snapshot = await db.collection('apps').doc(id).get()
      return snapshot.exists ? readAppDocument(snapshot.data(), snapshot.id) : null
    })
  )
  const apps = matches.filter((app): app is App => Boolean(app))
  if (apps.length > 1) throw new Error(`Duplicate canonical App id: ${id}`)
  return apps[0] ?? null
}
