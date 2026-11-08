import type { Firestore } from 'firebase-admin/firestore'
import { createError } from 'h3'
import { getRuntimeIdentityFirestore } from '../../../server/utils/getRuntimeFirestore'
import { requireFirestoreDocumentId } from '../../../server/utils/ids/path'
import {
  ECOSYSTEM_STATUSES,
  type Ecosystem,
} from '../../models/ecosystem.model.ts'

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function isStamp(
  value: unknown,
  allowAppId = false
): value is Ecosystem['created'] {
  if (!isRecord(value) || !isRecord(value.at)) return false
  if (
    typeof value.at.seconds !== 'number' ||
    typeof value.at.nanoseconds !== 'number'
  ) {
    return false
  }
  return (
    Object.keys(value).every(
      (key) => key === 'at' || key === 'by' || (allowAppId && key === 'app_id')
    ) &&
    (value.by === undefined || typeof value.by === 'string') &&
    (!allowAppId ||
      value.app_id === undefined ||
      typeof value.app_id === 'string')
  )
}

function canonicalEcosystem(
  id: string,
  value: unknown,
  activeOnly = true
): Ecosystem | null {
  if (!id || !isRecord(value)) return null
  const source = value
  const status = ECOSYSTEM_STATUSES.find(
    (candidate) => candidate === source.status
  )
  if (
    typeof source.project_id !== 'string' ||
    !source.project_id.trim() ||
    !status ||
    (activeOnly && status !== 'active') ||
    typeof source.name !== 'string' ||
    !source.name.trim()
  ) {
    return null
  }

  if (!isStamp(source.created, true) || !isStamp(source.updated)) {
    throw createError({
      statusCode: 409,
      statusMessage: `Ecosystem ${id} has invalid audit stamps.`,
    })
  }
  const projectStamp = (stamp: Ecosystem['created']) => ({
    at: { seconds: stamp.at.seconds, nanoseconds: stamp.at.nanoseconds },
    ...(stamp.by !== undefined ? { by: stamp.by } : {}),
  })

  return {
    id,
    project_id: source.project_id,
    status,
    name: source.name,
    ...(typeof source.description === 'string'
      ? { description: source.description }
      : {}),
    ...(typeof source.image_url === 'string'
      ? { image_url: source.image_url }
      : {}),
    ...(typeof source.website_url === 'string'
      ? { website_url: source.website_url }
      : {}),
    created: {
      ...projectStamp(source.created),
      ...(source.created.app_id !== undefined
        ? { app_id: source.created.app_id }
        : {}),
    },
    updated: projectStamp(source.updated),
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
