import type { Firestore } from 'firebase-admin/firestore'
import { createError } from 'h3'
import { getRuntimeIdentityFirestore } from '../../../server/utils/getRuntimeFirestore'
import { requireFirestoreDocumentId } from '../../../server/utils/ids/path'
import type { Ecosystem } from '../../models/ecosystem.model.ts'

const text = (value: unknown) => String(value ?? '').trim()

function canonicalEcosystem(
  id: string,
  value: unknown,
  activeOnly = true
): Ecosystem | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const source = value as Record<string, unknown>
  if (!['active', 'inactive', 'archived'].includes(text(source.status)))
    return null
  if (activeOnly && text(source.status) !== 'active') return null
  if (!text(source.project_id) || !text(source.name)) return null
  return { ...source, id } as unknown as Ecosystem
}

export async function readEcosystem(
  idValue: unknown,
  database: Firestore = getRuntimeIdentityFirestore(),
  options: { activeOnly?: boolean } = {}
): Promise<Ecosystem> {
  const id = requireFirestoreDocumentId(idValue, 'Ecosystem id')
  const snapshot = await database.collection('ecosystems').doc(id).get()
  const ecosystem = snapshot.exists
    ? canonicalEcosystem(
        snapshot.id,
        snapshot.data(),
        options.activeOnly !== false
      )
    : null
  if (!ecosystem) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Ecosystem not found.',
    })
  }
  return ecosystem
}

export async function readEcosystems(): Promise<Ecosystem[]> {
  const snapshot = await getRuntimeIdentityFirestore()
    .collection('ecosystems')
    .limit(100)
    .get()
  return snapshot.docs
    .map((document) => canonicalEcosystem(document.id, document.data()))
    .filter((ecosystem): ecosystem is Ecosystem => Boolean(ecosystem))
    .sort((left, right) => left.name.localeCompare(right.name))
}
