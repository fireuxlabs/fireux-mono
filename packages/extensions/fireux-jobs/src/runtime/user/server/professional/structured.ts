import { useRuntimeConfig } from '#imports'
import type { DocumentData, UpdateData } from 'firebase-admin/firestore'
import { createError, type H3Event } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverUserProfileTarget } from 'fireux-core/runtime/user/server/mutation-targets'
import {
  ProfessionalConstraints,
} from '../../utils/profiles/Professional/professional.ts'
import {
  assertProfessionalStructuredKeys,
  failProfessionalStructuredInput,
  normalizeProfessionalStructuredInput,
  PROFESSIONAL_STRUCTURED_FIELDS,
  requireProfessionalStructuredObject,
  type ProfessionalStructuredField,
} from './structured-input.ts'

export type { ProfessionalStructuredField } from './structured-input.ts'

export function runtimeDatabases(event: H3Event) {
  const runtime = useRuntimeConfig(event)
  const fireux = (runtime.public?.fireux ?? {}) as Record<string, unknown>
  const firebase = (runtime.public?.firebaseEcosystem?.firebase ??
    {}) as Record<string, unknown>
  const appId = String(fireux.id ?? '').trim()
  const appDatabaseId = String(firebase.databaseId ?? '').trim()
  const identityDatabaseId = String(
    firebase.identityDatabaseId ?? appDatabaseId
  ).trim()
  const profiles = new Set(
    Array.isArray(fireux.profiles)
      ? fireux.profiles
          .map((value) => String(value ?? '').trim())
          .filter(Boolean)
      : []
  )
  if (!isFirestoreDocumentId(appId) || !appDatabaseId || !identityDatabaseId) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Professional runtime authority is not configured.',
    })
  }
  if (!profiles.has('professional')) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Professional profiles are not enabled for this App.',
    })
  }
  return {
    appId,
    appDb: getRuntimeFirestore(appDatabaseId),
  }
}

export function assertActiveProfessional(
  snapshots: FirebaseFirestore.DocumentSnapshot[]
): void {
  const [appSnapshot, membershipSnapshot] = snapshots
  const membership = requireProfessionalStructuredObject(
    membershipSnapshot?.data() ?? {},
    'App membership'
  )
  const membershipRole = String(membership.role ?? '').trim()
  if (
    !appSnapshot?.exists ||
    !membershipSnapshot?.exists ||
    (membershipRole !== 'user' && membershipRole !== 'admin')
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: 'An active Professional profile in this App is required.',
    })
  }
}

export async function updateProfessionalStructuredField(
  event: H3Event,
  input: unknown
) {
  const { uid } = await requireFirebaseBearerUser(event)
  const body = requireProfessionalStructuredObject(
    input,
    'Professional structured update'
  )
  assertProfessionalStructuredKeys(
    body,
    ['field', 'items'],
    'Professional structured update'
  )
  const field = String(body.field ?? '').trim() as ProfessionalStructuredField
  if (!PROFESSIONAL_STRUCTURED_FIELDS.has(field)) {
    failProfessionalStructuredInput('Professional structured field is invalid.')
  }
  const normalized = normalizeProfessionalStructuredInput(field, body.items)
  const { appId, appDb } = runtimeDatabases(event)
  const checks = [
    appDb.doc(`apps/${appId}`),
    appDb.doc(`apps/${appId}/users/${uid}`),
    ...normalized.references.map((reference) => appDb.doc(reference.path)),
  ]
  const snapshots = await appDb.getAll(...checks)
  assertActiveProfessional(snapshots)
  const missingReference = normalized.references.find(
    (_, index) => !snapshots[index + 2]?.exists
  )
  if (missingReference) {
    failProfessionalStructuredInput(
      `${missingReference.label} is not available.`
    )
  }

  await runGuardedServerTransaction({ kind: 'identity' }, async (mutations) => {
    const profiles = serverUserProfileTarget(uid, 'professional', 'identity')
    const snapshot = await mutations.read(
      profiles,
      'professional'
    )
    if (!snapshot.exists) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Professional profile not found.',
      })
    }
    const current = snapshot.data ?? {}
    const total = [...PROFESSIONAL_STRUCTURED_FIELDS].reduce(
      (count, key) =>
        count +
        (key === field
          ? normalized.items.length
          : Array.isArray(current[key])
            ? current[key].length
            : 0),
      0
    )
    if (total > ProfessionalConstraints.structuredTotal) {
      failProfessionalStructuredInput(
        `Professional details support at most ${ProfessionalConstraints.structuredTotal} structured items in total.`
      )
    }
    const patch: UpdateData<DocumentData> = {
      [field]: normalized.items,
      updated: serverAuditStamp({ by: uid }),
    }
    mutations.update(
      profiles,
      'professional',
      patch
    )
  })
  return { updated: true, field, count: normalized.items.length }
}
