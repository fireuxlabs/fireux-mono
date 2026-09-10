import type { App } from 'fireux-core/runtime/app/models/app.model'
import { createError } from 'h3'
import {
  appCollectionPage,
  readAppPageInput,
  readAppRecords,
} from 'fireux-core/runtime/app/server/collection/read'
import { readAppDocument } from 'fireux-core/runtime/app/utils/readApp'
import { PLATFORM_DIRECTORY_TARGETS } from '../config/platform-directory-targets'
import { getFirestoreDb, getFirestoreProjectDb } from './firebase-admin'

/** Public directory pages and complete parent-scoped App relationships. */
export async function readPlatformAppCollection(
  input: Record<string, unknown>
) {
  const { limit, cursor } = readAppPageInput(input)
  const parentId = (value: unknown) => {
    if (value === undefined) return ''
    if (
      typeof value !== 'string' ||
      !value.trim() ||
      value.includes('/') ||
      value.length > 1500
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid App parent.',
      })
    }
    return value.trim()
  }
  const projectId = parentId(input.projectId)
  const ecosystemId = parentId(input.ecosystemId)
  if (projectId && ecosystemId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Specify one App parent.',
    })
  }
  let ecosystemIds: string[] | undefined
  if (projectId) {
    const db = await getFirestoreDb()
    const ecosystems = await db
      .collection('ecosystems')
      .where('project_id', '==', projectId)
      .get()
    ecosystemIds = ecosystems.docs.map((document) => document.id)
  } else if (ecosystemId) {
    ecosystemIds = [ecosystemId]
  }
  const targets = ecosystemIds
    ? ecosystemIds.map((id) => {
        const target = PLATFORM_DIRECTORY_TARGETS.find(
          (entry) => entry.ecosystemId === id
        )
        if (!target)
          throw createError({
            statusCode: 409,
            statusMessage: 'An Ecosystem has no configured App database.',
          })
        return target
      })
    : PLATFORM_DIRECTORY_TARGETS
  // A failed page cannot safely advance a shared cursor past an unavailable source.
  const groups = await Promise.all(
    targets.map(async (target) => {
      const db = await getFirestoreProjectDb(
        target.projectId,
        target.databaseId
      )
      return readAppRecords(
        db,
        ecosystemIds
          ? { ecosystemId: target.ecosystemId, activeOnly: true }
          : { activeOnly: true, limit: limit + 1, cursor }
      )
    })
  )
  return appCollectionPage(groups.flat(), ecosystemIds ? undefined : limit)
}

/** Fetch every canonical App document across configured ecosystem databases. */
export async function readPlatformApps(): Promise<App[]> {
  const outcomes = await Promise.allSettled(
    PLATFORM_DIRECTORY_TARGETS.map(async (target) => {
      const db = await getFirestoreProjectDb(
        target.projectId,
        target.databaseId
      )
      const snapshot = await db.collection('apps').get()
      return snapshot.docs.flatMap((document) => {
        const app = readAppDocument(document.data(), document.id)
        return app?.status === 'active' ? [app] : []
      })
    })
  )
  const collections = outcomes.flatMap((outcome) =>
    outcome.status === 'fulfilled' ? [outcome.value] : []
  )
  const failures = outcomes.flatMap((outcome, index) =>
    outcome.status === 'rejected'
      ? [
          {
            target: PLATFORM_DIRECTORY_TARGETS[index].key,
            reason:
              outcome.reason instanceof Error
                ? outcome.reason.message
                : String(outcome.reason),
          },
        ]
      : []
  )

  if (!collections.length && failures.length) {
    throw new AggregateError(
      outcomes.flatMap((outcome) =>
        outcome.status === 'rejected' ? [outcome.reason] : []
      ),
      'Every platform App source failed.'
    )
  }
  if (failures.length) {
    console.warn('[platform-apps] Some App sources were unavailable.', failures)
  }

  const apps = collections.flat()
  const ids = new Set<string>()
  for (const app of apps) {
    if (ids.has(app.id))
      throw new Error(`Duplicate canonical App id: ${app.id}`)
    ids.add(app.id)
  }
  return apps.sort((left, right) => left.id.localeCompare(right.id))
}

export async function readPlatformApp(appId: string): Promise<App | null> {
  const id = String(appId || '').trim()
  if (!id || id.includes('/')) return null
  const matches = await Promise.all(
    PLATFORM_DIRECTORY_TARGETS.map(async (target) => {
      const db = await getFirestoreProjectDb(
        target.projectId,
        target.databaseId
      )
      const snapshot = await db.collection('apps').doc(id).get()
      return snapshot.exists
        ? readAppDocument(snapshot.data(), snapshot.id)
        : null
    })
  )
  const apps = matches.filter((app): app is App => Boolean(app))
  if (apps.length > 1) throw new Error(`Duplicate canonical App id: ${id}`)
  return apps[0]?.status === 'active' ? apps[0] : null
}
