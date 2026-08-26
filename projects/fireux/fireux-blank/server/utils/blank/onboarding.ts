// Concurrent edit — 2026-07-21 22:28 CEST — Workspace family alignment: atomically create Blank root and App support.
// Concurrent edit — 2026-07-21 23:22 CEST — Workspace family alignment: keep access out of Blank root and reject coerced target ids.
import { createError, type H3Event } from 'h3'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { resolveFireuxEntityManagementForApp } from 'fireux-core/runtime/utils/entity-management'
import { resolveWorkspaceCanCreate } from 'fireux-core/runtime/utils/workspace-policy'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { BlankStorage } from '../../../app/models/blank.model.ts'

type BlankOnboardingResult = {
  ok: true
  id: string
  createdRoot: true
  createdAppSupport: true
}

const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

function fail(statusCode: number, statusMessage: string): never {
  throw createError({ statusCode, statusMessage })
}

function request(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail(400, 'Blank onboarding request must be an object.')
  }
  const body = record(value)
  const unsupported = Object.keys(body).find((key) => key !== 'name')
  if (unsupported) {
    fail(400, `Blank onboarding contains unsupported field: ${unsupported}.`)
  }
  const name = text(body.name) || 'Blank target'
  if (name.length > 120) fail(400, 'Blank name is too long.')
  return { name }
}

function stringList(value: unknown, label: string, max: number) {
  if (!Array.isArray(value) || value.length > max) {
    fail(409, `${label} has an invalid stored shape.`)
  }
  if (value.some((item) => typeof item !== 'string')) {
    fail(409, `${label} has invalid stored ids.`)
  }
  const items = (value as string[]).map((item) => item.trim())
  if (
    items.some(
      (item, index) => !item || item !== value[index] || item.length > 1500
    ) ||
    new Set(items).size !== items.length
  ) {
    fail(409, `${label} has invalid stored ids.`)
  }
  return items
}

export async function completeBlankOnboarding(
  event: H3Event,
  input: unknown
): Promise<BlankOnboardingResult> {
  const { name } = request(input)
  const { uid } = await requireFirebaseBearerUser(event)
  const fireux = useFireUXConfig(event)
  const appId = requireFirestoreDocumentId(fireux.appId, 'Runtime App id')
  const role = fireux.role
  const management = resolveFireuxEntityManagementForApp(
    role,
    appId,
    fireux.ecosystem
  )

  const canCreate = resolveWorkspaceCanCreate(role, fireux.workspaceConfig, 'blank')
  if (!canCreate) fail(403, 'Blank creation is disabled for this App.')

  const db = getRuntimeFirestore()
  const membershipRef = db.doc(
    `apps/${appId}/${'users'}/${uid}`
  )
  const rootRef = db.collection(BlankStorage.rootCollection).doc()
  const supportRef = db.doc(
    `apps/${appId}/${BlankStorage.appCollection}/${rootRef.id}`
  )

  return db.runTransaction(async (transaction) => {
    const membership = await transaction.get(membershipRef)
    if (!membership.exists || text(membership.get('role')) !== 'admin') {
      fail(403, 'Current App admin membership is required to create a Blank.')
    }

    const slug = normalizeSlug(`${name}-${rootRef.id.slice(0, 6)}`)
    transaction.create(rootRef, {
      management,
      name,
      slug,
      status: 'active',
      created: serverAuditStamp({ by: uid, appId }),
      updated: serverAuditStamp({ by: uid }),
    })
    transaction.create(supportRef, {
      blank_id: rootRef.id,
      operator_ids: [uid],
      team_ids: [uid],
      join_requests: [],
      created: serverAuditStamp({ by: uid, appId }),
      updated: serverAuditStamp({ by: uid }),
    })
    return {
      ok: true,
      id: rootRef.id,
      createdRoot: true,
      createdAppSupport: true,
    }
  })
}
