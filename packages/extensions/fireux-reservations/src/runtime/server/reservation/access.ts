import { useRuntimeConfig } from '#imports'
import type { H3Event } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { canonicalPropertyRoot } from 'fireux-properties/runtime/composables/fireux/firestore/property/utils/view/usePropertyInterface'
import {
  PropertyStorage,
  type Property,
} from 'fireux-properties/runtime/models/property.model'
import { reservationFail } from './records.ts'

type Firestore = ReturnType<typeof getRuntimeFirestore>
const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, any> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, any>)
    : {}

function boundedIds(value: unknown, max: number, label: string) {
  if (
    !Array.isArray(value) ||
    value.length > max ||
    value.some((id) => typeof id !== 'string')
  ) {
    reservationFail(409, `${label} has an invalid stored shape.`)
  }
  const ids = (value as string[]).map(text)
  if (
    ids.some((id, index) => !id || id !== value[index]) ||
    new Set(ids).size !== ids.length
  ) {
    reservationFail(409, `${label} has invalid stored ids.`)
  }
  return ids
}

export type ReservationActor = {
  uid: string
  appId: string
  propertyId: string
  db: Firestore
  canWrite: boolean
}

export async function requireReservationActor(
  event: H3Event,
  rawPropertyId: unknown,
  write = false
): Promise<ReservationActor> {
  const { uid } = await requireFirebaseBearerUser(event)
  const fireux = record(useRuntimeConfig(event).public?.fireux)
  const appId = requireFirestoreDocumentId(fireux.id, 'Runtime App id')
  const propertyId = requireFirestoreDocumentId(rawPropertyId, 'Property id')
  const db = getRuntimeFirestore()
  const [membership, support, root] = await db.getAll(
    db.doc(`apps/${appId}/users/${uid}`),
    db.doc(
      `apps/${appId}/${PropertyStorage.appSupportCollection}/${propertyId}`
    ),
    db.collection(PropertyStorage.rootCollection).doc(propertyId)
  )
  const memberRole = text(membership.get('role'))
  if (!membership.exists || !['admin', 'user'].includes(memberRole)) {
    reservationFail(403, 'Current App membership is required.')
  }
  const rootValue = root.exists
    ? canonicalPropertyRoot({ ...(root.data() as Property), id: propertyId })
    : null
  if (!rootValue) reservationFail(404, 'Property not found.')
  if (!support.exists) reservationFail(403, 'Property access is required.')
  const operators = boundedIds(
    support.get('operator_ids'),
    50,
    'Property operators'
  )
  const team = boundedIds(support.get('team_ids'), 100, 'Property team')
  boundedIds(support.get('join_requests'), 100, 'Property join requests')
  const canWrite = memberRole === 'admin' || operators.includes(uid)
  const canRead = canWrite || team.includes(uid)
  if (!canRead) reservationFail(403, 'Property read access is required.')
  if (write && !canWrite)
    reservationFail(403, 'Property operator access is required.')
  return { uid, appId, propertyId, db, canWrite }
}
