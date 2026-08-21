import { createError } from 'h3'
import { getRuntimeIdentityFirestore } from '../../../server/utils/getRuntimeFirestore'
import { requireFirestoreDocumentId } from '../../../server/utils/ids/path'
import {
  EcosystemStorage,
  type Ecosystem,
} from '../../models/ecosystem.model.ts'

const text = (value: unknown) => String(value ?? '').trim()

function canonicalEcosystem(id: string, value: unknown): Ecosystem | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const source = value as Record<string, unknown>
  if (text(source.status) !== 'active') return null
  if (!text(source.project_id) || !text(source.name)) return null
  return { ...source, id } as unknown as Ecosystem
}

export async function readEcosystem(idValue: unknown): Promise<Ecosystem> {
  const id = requireFirestoreDocumentId(idValue, 'Ecosystem id')
  const snapshot = await getRuntimeIdentityFirestore()
    .collection(EcosystemStorage.collection)
    .doc(id)
    .get()
  const ecosystem = snapshot.exists
    ? canonicalEcosystem(snapshot.id, snapshot.data())
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
    .collection(EcosystemStorage.collection)
    .limit(100)
    .get()
  return snapshot.docs
    .map((document) => canonicalEcosystem(document.id, document.data()))
    .filter((ecosystem): ecosystem is Ecosystem => Boolean(ecosystem))
    .sort((left, right) => left.name.localeCompare(right.name))
}
