import { useRuntimeConfig } from '#imports'
import { createError, defineEventHandler, readBody } from 'h3'
import { FieldValue } from 'firebase-admin/firestore'
import { AppUserStorage } from 'fireux-core/runtime/models/core/user.model'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  INTERLAKEN_ESSEN_APP_ID,
  MARKETPLACE_PROFILE_COLLECTION,
  type MarketplaceAccountSettings,
  type MarketplaceAccountSettingsInput,
} from '../../../app/content/marketplace-profile'

type RecordValue = Record<string, unknown>

const allowedFields = new Set(['delivery_address'])

function fail(statusCode: number, statusMessage: string): never {
  throw createError({ statusCode, statusMessage })
}

function parseRequest(value: unknown): MarketplaceAccountSettingsInput {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail(400, 'The account settings request must be an object.')
  }

  const body = value as RecordValue
  const unsupported = Object.keys(body).find(key => !allowedFields.has(key))
  if (unsupported) {
    fail(400, `The account settings request contains an unsupported field: ${unsupported}.`)
  }
  if (typeof body.delivery_address !== 'string') {
    fail(400, 'Delivery address must be text.')
  }

  const deliveryAddress = body.delivery_address.trim()
  if (deliveryAddress.length > 500) {
    fail(400, 'Delivery address is too long.')
  }

  return {
    delivery_address: deliveryAddress,
  }
}

export default defineEventHandler(async (event) => {
  const runtime = useRuntimeConfig(event)
  const appId = String(runtime.public?.fireux?.id || '').trim()
  if (appId !== INTERLAKEN_ESSEN_APP_ID) {
    fail(500, 'The Interlaken Essen runtime identity is not configured.')
  }

  const { uid } = await requireFirebaseBearerUser(event)
  const input = parseRequest(await readBody(event))
  const db = getRuntimeFirestore()
  const membershipRef = db.doc(
    `apps/${appId}/${AppUserStorage.collection}/${uid}`
  )
  const profileRef = db.doc(
    `apps/${appId}/${MARKETPLACE_PROFILE_COLLECTION}/${uid}`
  )

  await db.runTransaction(async (transaction) => {
    const [membership, profile] = await Promise.all([
      transaction.get(membershipRef),
      transaction.get(profileRef),
    ])
    const role = String(membership.get('role') || '').trim()
    if (!membership.exists || (role !== 'user' && role !== 'admin')) {
      fail(403, 'A valid Interlaken Essen membership is required.')
    }

    transaction.set(profileRef, {
      id: uid,
      delivery_address:
        input.delivery_address || FieldValue.delete(),
      ...(!profile.exists
        ? { created: serverAuditStamp({ by: uid, appId }) }
        : {}),
      updated: serverAuditStamp({ by: uid }),
    }, { merge: true })
  })

  const settings: MarketplaceAccountSettings = {
    delivery_address: input.delivery_address,
  }

  return {
    ok: true,
    settings,
  }
})
