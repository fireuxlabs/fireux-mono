import type { Firestore } from 'firebase-admin/firestore'
import { createError } from 'h3'
import { getRuntimeIdentityFirestore } from '../../../server/utils/getRuntimeFirestore'
import { requireFirestoreDocumentId } from '../../../server/utils/ids/path'
import type {
  Ecosystem,
  EcosystemPublicSummary,
  EcosystemStatus,
} from '../../models/ecosystem.model.ts'
import type { FireuxStamps } from '../../../models/utils/stamps.model.ts'

const text = (value: unknown) => String(value ?? '').trim()

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function isStamp(value: unknown, allowAppId = false): boolean {
  if (!isRecord(value) || !isRecord(value.at)) return false
  return (
    typeof value.at.seconds === 'number' &&
    typeof value.at.nanoseconds === 'number' &&
    Object.keys(value).every(
      (key) => key === 'at' || key === 'by' || (allowAppId && key === 'app_id')
    ) &&
    (value.by === undefined || typeof value.by === 'string') &&
    (value.app_id === undefined ||
      (allowAppId && typeof value.app_id === 'string'))
  )
}

export function readEcosystemDocument(
  id: string,
  value: unknown,
  activeOnly = true
): Ecosystem | null {
  if (!isRecord(value) || (value.id !== undefined && value.id !== id))
    return null
  const source = value
  const status = text(source.status) as EcosystemStatus
  if (!['active', 'inactive', 'archived'].includes(status)) return null
  if (activeOnly && status !== 'active') return null
  if (
    !text(source.project_id) ||
    !text(source.name) ||
    typeof source.description !== 'string' ||
    typeof source.image_url !== 'string' ||
    (source.website_url !== undefined &&
      typeof source.website_url !== 'string') ||
    (source.context !== undefined &&
      (typeof source.context !== 'string' || source.context.length > 32000)) ||
    !isStamp(source.created, true) ||
    !isStamp(source.updated)
  )
    return null
  const created = source.created as FireuxStamps['created']
  const updated = source.updated as FireuxStamps['updated']
  return {
    id,
    project_id: text(source.project_id),
    status,
    name: text(source.name),
    description: source.description,
    image_url: source.image_url,
    ...(typeof source.website_url === 'string'
      ? { website_url: source.website_url }
      : {}),
    created,
    updated,
  }
}

export function toEcosystemPublicSummary(
  ecosystem: Ecosystem
): EcosystemPublicSummary {
  return {
    id: ecosystem.id,
    project_id: ecosystem.project_id,
    status: ecosystem.status,
    name: ecosystem.name,
    description: ecosystem.description,
    image_url: ecosystem.image_url,
    ...(ecosystem.website_url !== undefined
      ? { website_url: ecosystem.website_url }
      : {}),
  }
}

export async function readEcosystem(
  idValue: unknown,
  database: Firestore = getRuntimeIdentityFirestore(),
  options: { activeOnly?: boolean } = {}
): Promise<Ecosystem> {
  const id = requireFirestoreDocumentId(idValue, 'Ecosystem id')
  const snapshot = await database.collection('ecosystems').doc(id).get()
  const ecosystem = snapshot.exists
    ? readEcosystemDocument(
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
    .map((document) => readEcosystemDocument(document.id, document.data()))
    .filter((ecosystem): ecosystem is Ecosystem => Boolean(ecosystem))
    .sort((left, right) => left.name.localeCompare(right.name))
}
