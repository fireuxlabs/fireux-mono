import { defineEventHandler, createError } from 'h3'
import type { Firestore } from 'firebase-admin/firestore'
import { getFirestoreDb } from './firebase-admin'

type RegistryDocument = Record<string, unknown> & { id?: string }

async function fetchCollection(db: Firestore, collection: string) {
  const snapshot = await db.collection(collection).get()
  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .sort((a, b) => (a.id > b.id ? 1 : a.id < b.id ? -1 : 0))
}

function normalizeEcosystems(raw: RegistryDocument[]) {
  const canonical = new Map<string, RegistryDocument>()
  const legacyAppGroups = new Map<string, string[]>()

  for (const entry of raw) {
    if (!entry || typeof entry.id !== 'string') continue

    const hasTeam =
      typeof entry.team === 'string' && entry.team.trim().length > 0
    const apps = Array.isArray(entry.apps)
      ? entry.apps.filter((app): app is string => typeof app === 'string')
      : null

    if (!hasTeam && apps?.length) {
      legacyAppGroups.set(entry.id.toLowerCase(), apps)
      continue
    }

    if (!canonical.has(entry.id)) {
      canonical.set(entry.id, { ...entry })
    }
  }

  const normalised = Array.from(canonical.values()).map((entry) => {
    const nameKey =
      typeof entry.name === 'string' && entry.name.trim().length
        ? entry.name.trim().toLowerCase()
        : entry.id?.toLowerCase()

    if (nameKey && legacyAppGroups.has(nameKey)) {
      entry.apps = legacyAppGroups.get(nameKey)
    }

    return entry
  })

  if (legacyAppGroups.size > 0 && normalised.length === 0) {
    console.warn(
      '[registry.get] Only legacy ecosystem docs found; returning raw snapshot.'
    )
    return raw
  }

  if (legacyAppGroups.size > 0) {
    const unmatched = Array.from(legacyAppGroups.entries()).filter(
      ([key]) =>
        !normalised.some(
          (entry) =>
            (typeof entry.name === 'string' &&
              entry.name.trim().toLowerCase() === key) ||
            entry.id?.toLowerCase() === key
        )
    )

    if (unmatched.length) {
      console.warn(
        '[registry.get] Legacy ecosystem docs without matches:',
        unmatched.map(([key]) => key)
      )
    }
  }

  return normalised
}

export default defineEventHandler(async () => {
  try {
    const db = await getFirestoreDb('registry')
    const [modules, apps, rawEcosystems] = await Promise.all([
      fetchCollection(db, 'modules'),
      fetchCollection(db, 'apps'),
      fetchCollection(db, 'ecosystems'),
    ])

    const ecosystems = normalizeEcosystems(rawEcosystems as RegistryDocument[])

    return {
      ok: true,
      generatedAt: new Date().toISOString(),
      modules,
      apps,
      ecosystems,
    }
  } catch (error) {
    console.error('[registry.get]', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Unable to read registry data.',
    })
  }
})
