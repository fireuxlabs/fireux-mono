// Concurrent edit — 2026-07-21 14:18 CEST — Werkbox Firebase hardening: materialize same-id Companies only for current-App members after the canonical Place exists.
import { useRuntimeConfig } from '#imports'
import { FieldValue } from 'firebase-admin/firestore'
import { createError, type H3Event } from 'h3'
import { UserAppStorage } from 'fireux-core/runtime/models/core/user.model.ts'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path.ts'
import { PlaceStorage } from 'fireux-places/runtime/models/place.model'
import { CompanyStorage } from '../../models/company.model'

type CompanyMaterializeRequest = {
  id?: unknown
}

function badRequest(statusMessage: string): never {
  throw createError({ statusCode: 400, statusMessage })
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    badRequest('Company materialization request must be an object.')
  }
  return value as Record<string, unknown>
}

export async function materializeCompany(
  event: H3Event,
  input: CompanyMaterializeRequest
) {
  const { uid } = await requireFirebaseBearerUser(event)
  const body = record(input)
  const unsupported = Object.keys(body).find(key => key !== 'id')
  if (unsupported) {
    badRequest(`Company materialization contains unsupported field: ${unsupported}.`)
  }

  const id = requireFirestoreDocumentId(body.id, 'Company id')
  const db = getRuntimeFirestore()
  const runtimeAppId = requireFirestoreDocumentId(
    useRuntimeConfig(event).public?.fireux?.id,
    'Runtime App id'
  )
  const membershipRef = db.doc(
    `apps/${runtimeAppId}/${UserAppStorage.collection}/${uid}`
  )
  const placeRef = db.collection(PlaceStorage.collection).doc(id)
  const companyRef = db.collection(CompanyStorage.collection).doc(id)

  const created = await db.runTransaction(async transaction => {
    const membershipSnapshot = await transaction.get(membershipRef)
    if (
      !membershipSnapshot.exists ||
      !['admin', 'user'].includes(String(membershipSnapshot.get('role') || ''))
    ) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Current App membership is required to materialize a Company.',
      })
    }
    const placeSnapshot = await transaction.get(placeRef)
    const companySnapshot = await transaction.get(companyRef)
    if (!placeSnapshot.exists) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Create the canonical Place before materializing its Company.',
      })
    }
    if (companySnapshot.exists) return false

    transaction.create(companyRef, {
      created: { at: FieldValue.serverTimestamp() },
      updated: { at: FieldValue.serverTimestamp() },
    })
    return true
  })

  return { ok: true, id, created }
}
