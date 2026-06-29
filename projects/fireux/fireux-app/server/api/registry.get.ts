import { defineEventHandler, createError } from 'h3'
import type { Firestore } from 'firebase-admin/firestore'
import { getFirestoreDb } from '../utils/firebase-admin'

type RegistryDocument = Record<string, unknown> & { id?: string }

async function fetchCollection(db: Firestore, collection: string) {
  const snapshot = await db.collection(collection).get()
  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .sort((a, b) => (a.id > b.id ? 1 : a.id < b.id ? -1 : 0))
}

export default defineEventHandler(async () => {
  try {
    const db = await getFirestoreDb('registry')
    const [modules, apps, rawEcosystems] = await Promise.all([
      fetchCollection(db, 'modules'),
      fetchCollection(db, 'apps'),
      fetchCollection(db, 'ecosystems'),
    ])

    return {
      ok: true,
      generatedAt: new Date().toISOString(),
      modules,
      apps,
      ecosystems: rawEcosystems as RegistryDocument[],
    }
  } catch (error) {
    console.error('[registry.get]', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Unable to read registry data.',
    })
  }
})
