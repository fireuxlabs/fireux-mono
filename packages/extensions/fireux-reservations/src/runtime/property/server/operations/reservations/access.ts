import type { H3Event } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { canonicalPropertyRoot } from 'fireux-properties/runtime/property/composables/firestore/utils/view/usePropertyInterface'
import type { Property } from 'fireux-properties/runtime/property/models/property.model'
import {
  readPropertyMutationActor,
  requirePropertyMutationAuthority,
} from 'fireux-properties/runtime/property/server/team/authority'
import { reservationFail } from './records.ts'

type Firestore = ReturnType<typeof getRuntimeFirestore>

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
  _write = false
): Promise<ReservationActor> {
  const propertyId = requireFirestoreDocumentId(rawPropertyId, 'Property id')
  const actor = await readPropertyMutationActor(event)
  const scope = await runGuardedServerTransaction({ kind: 'runtime' }, (tx) =>
    requirePropertyMutationAuthority(tx, actor, propertyId)
  )
  const root = canonicalPropertyRoot({
    ...(scope.rootData as Property),
    id: propertyId,
  })
  if (!root) reservationFail(404, 'Property not found.')
  return {
    uid: actor.uid,
    appId: actor.runtimeAppId,
    propertyId,
    db: getRuntimeFirestore(),
    canWrite: true,
  }
}
