// Concurrent edit — 2026-07-21 14:18 CEST — Werkbox Firebase hardening: create Places only for current-App members through a strict idempotent server boundary.
// Concurrent edit — 2026-07-21 14:52 CEST — Place provenance/privacy hardening: accept only an id and verify missing Place truth with the server-side provider.
import { useRuntimeConfig } from '#imports'
import { createError, type H3Event } from 'h3'
import { AppUserStorage } from 'fireux-core/runtime/user/models/user.model'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  FIRESTORE_MUTATION_TARGETS,
  serverAppUsersTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { PlaceStorage } from '../../models/place.model.ts'
import { fetchVerifiedGooglePlacePayload } from '../integration/google/details'

type PlaceEnsureRequest = {
  id?: unknown
}

function badRequest(statusMessage: string): never {
  throw createError({ statusCode: 400, statusMessage })
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    badRequest('Place ensure request must be an object.')
  }
  return value as Record<string, unknown>
}

function requireCurrentAppMembership(exists: boolean, role: unknown) {
  if (!exists || !['admin', 'user'].includes(String(role || ''))) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Current App membership is required to create a Place.',
    })
  }
}

export async function ensurePlace(event: H3Event, input: PlaceEnsureRequest) {
  const { uid } = await requireFirebaseBearerUser(event)
  const body = record(input)
  const unsupported = Object.keys(body).find((key) => key !== 'id')
  if (unsupported) {
    badRequest(
      `Place ensure request contains unsupported field: ${unsupported}.`
    )
  }

  const id = requireFirestoreDocumentId(body.id, 'Place id')
  const runtimeAppId = requireFirestoreDocumentId(
    useRuntimeConfig(event).public?.fireux?.id,
    'Runtime App id'
  )
  const db = getRuntimeFirestore()
  const membershipRef = db.doc(
    `apps/${runtimeAppId}/${AppUserStorage.collection}/${uid}`
  )
  const placeRef = db.collection(PlaceStorage.collection).doc(id)

  // Reject non-members before spending provider quota. Existing Places are
  // still membership-scoped because this endpoint participates in Job and
  // profile write flows rather than serving as a public existence oracle.
  const [membershipSnapshot, placeSnapshot] = await Promise.all([
    membershipRef.get(),
    placeRef.get(),
  ])
  requireCurrentAppMembership(
    membershipSnapshot.exists,
    membershipSnapshot.get('role')
  )
  if (placeSnapshot.exists) return { ok: true, id, created: false }

  const payload = await fetchVerifiedGooglePlacePayload(event, id)
  const memberships = serverAppUsersTarget(runtimeAppId)
  const places = FIRESTORE_MUTATION_TARGETS.places
  const created = await runGuardedServerTransaction(
    places.database,
    async (mutations) => {
      const [liveMembership, livePlace] = await Promise.all([
        mutations.read<Record<string, unknown>>(memberships, uid),
        mutations.read<Record<string, unknown>>(places, id),
      ])
      requireCurrentAppMembership(
        liveMembership.exists,
        liveMembership.data?.role
      )
      if (livePlace.exists) return false

      mutations.create(places, id, {
        ...payload,
        created: serverAuditStamp({
          by: uid,
          appId: runtimeAppId,
        }),
        updated: serverAuditStamp({ by: uid }),
      })
      return true
    }
  )

  return { ok: true, id, created }
}
