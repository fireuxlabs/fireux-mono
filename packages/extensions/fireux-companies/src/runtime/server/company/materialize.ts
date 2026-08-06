// Concurrent edit — 2026-07-21 14:18 CEST — Werkbox Firebase hardening: materialize same-id Companies only for current-App members after the canonical Place exists.
// Concurrent edit — 2026-07-21 15:20 CEST — Misebox Nitro startup fix: resolve the Place model through its explicit TypeScript server import.
// Concurrent edit — 2026-07-28 — Entity canon: fail closed on malformed Place and Company roots.
import { useRuntimeConfig } from '#imports'
import { FieldValue } from 'firebase-admin/firestore'
import { createError, type H3Event } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import {
  FIRESTORE_MUTATION_TARGETS,
  serverAppUsersTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { projectPublicPlace } from 'fireux-places/runtime/server/place/public-projection'
import { canonicalCompanyRole } from './canonical'

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
  const unsupported = Object.keys(body).find((key) => key !== 'id')
  if (unsupported) {
    badRequest(
      `Company materialization contains unsupported field: ${unsupported}.`
    )
  }

  const id = requireFirestoreDocumentId(body.id, 'Company id')
  const runtimeAppId = requireFirestoreDocumentId(
    useRuntimeConfig(event).public?.fireux?.id,
    'Runtime App id'
  )
  const created = await runGuardedServerTransaction(
    { kind: 'runtime' },
    async (mutations) => {
      const membershipSnapshot = await mutations.read(
        serverAppUsersTarget(runtimeAppId),
        uid
      )
      if (
        !membershipSnapshot.exists ||
        !['admin', 'user'].includes(String(membershipSnapshot.data?.role || ''))
      ) {
        throw createError({
          statusCode: 403,
          statusMessage:
            'Current App membership is required to materialize a Company.',
        })
      }
      const [placeSnapshot, companySnapshot] = await Promise.all([
        mutations.read(FIRESTORE_MUTATION_TARGETS.places, id),
        mutations.read(FIRESTORE_MUTATION_TARGETS.companies, id),
      ])
      if (
        !placeSnapshot.exists ||
        !projectPublicPlace(id, placeSnapshot.data || {})
      ) {
        throw createError({
          statusCode: 409,
          statusMessage:
            'Create a valid canonical Place before materializing its Company.',
        })
      }
      if (companySnapshot.exists) {
        if (!canonicalCompanyRole(id, companySnapshot.data)) {
          throw createError({
            statusCode: 409,
            statusMessage:
              'The existing Company role record is malformed and cannot be reused.',
          })
        }
        return false
      }

      mutations.create(FIRESTORE_MUTATION_TARGETS.companies, id, {
        created: { at: FieldValue.serverTimestamp() },
        updated: { at: FieldValue.serverTimestamp() },
      })
      return true
    }
  )

  return { ok: true, id, created }
}
