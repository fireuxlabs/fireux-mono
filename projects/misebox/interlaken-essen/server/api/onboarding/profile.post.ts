import { useRuntimeConfig } from '#imports'
import { createError, defineEventHandler, readBody } from 'h3'
import { FieldValue } from 'firebase-admin/firestore'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  INTERLAKEN_ESSEN_APP_ID,
  INTERLAKEN_LOCALITIES,
  MARKETPLACE_PROFILE_KIND,
  OTHER_LOCALITY_ID,
  marketplaceProfileAppStatePath,
  marketplaceProfilePath,
  type MarketplaceOnboardingInput,
} from '../../../app/content/marketplace-profile'

type RecordValue = Record<string, unknown>

const allowedFields = new Set([
  'locality_id',
  'locality_label',
  'postal_code',
  'offers_enabled',
  'public_name',
  'introduction',
])

function fail(statusCode: number, statusMessage: string): never {
  throw createError({ statusCode, statusMessage })
}

function record(value: unknown): RecordValue {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail(400, 'The onboarding request must be an object.')
  }
  return value as RecordValue
}

function text(
  value: unknown,
  label: string,
  options: { required?: boolean; max: number; min?: number }
) {
  if (value === undefined || value === null) {
    if (options.required) fail(400, `${label} is required.`)
    return ''
  }
  if (typeof value !== 'string') fail(400, `${label} must be text.`)

  const normalized = value.trim()
  if (options.required && normalized.length < (options.min ?? 1)) {
    fail(400, `${label} is too short.`)
  }
  if (normalized.length > options.max) {
    fail(400, `${label} is too long.`)
  }
  return normalized
}

function parseRequest(value: unknown): MarketplaceOnboardingInput & {
  locality_label: string
  postal_code: string
} {
  const body = record(value)
  const unsupported = Object.keys(body).find((key) => !allowedFields.has(key))
  if (unsupported) {
    fail(
      400,
      `The onboarding request contains an unsupported field: ${unsupported}.`
    )
  }
  if (typeof body.offers_enabled !== 'boolean') {
    fail(400, 'Offer availability must be true or false.')
  }

  const localityId = text(body.locality_id, 'Local area', {
    required: true,
    max: 40,
  })
  const knownLocality = INTERLAKEN_LOCALITIES.find(
    (locality) => locality.id === localityId
  )

  let localityLabel = knownLocality?.label ?? ''
  let postalCode = knownLocality?.postalCode ?? ''
  if (!knownLocality) {
    if (localityId !== OTHER_LOCALITY_ID) {
      fail(400, 'The selected local area is not supported.')
    }
    localityLabel = text(body.locality_label, 'Place', {
      required: true,
      min: 2,
      max: 80,
    })
    postalCode = text(body.postal_code, 'Postal code', {
      required: true,
      max: 4,
      min: 4,
    })
    if (!/^\d{4}$/.test(postalCode)) {
      fail(400, 'Postal code must contain four digits.')
    }
  }

  const offersEnabled = body.offers_enabled
  const publicName = offersEnabled
    ? text(body.public_name, 'Offer name', {
        required: true,
        min: 2,
        max: 80,
      })
    : ''
  const introduction = offersEnabled
    ? text(body.introduction, 'Introduction', {
        required: true,
        min: 10,
        max: 280,
      })
    : ''

  return {
    locality_id: localityId as MarketplaceOnboardingInput['locality_id'],
    locality_label: localityLabel,
    postal_code: postalCode,
    offers_enabled: offersEnabled,
    ...(offersEnabled
      ? {
          public_name: publicName,
          introduction,
        }
      : {}),
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
    `apps/${appId}/${'users'}/${uid}`
  )
  const profileRef = db.doc(marketplaceProfilePath(uid))
  const appStateRef = db.doc(marketplaceProfileAppStatePath(uid))

  await db.runTransaction(async (transaction) => {
    const [membership, profile, appState] = await Promise.all([
      transaction.get(membershipRef),
      transaction.get(profileRef),
      transaction.get(appStateRef),
    ])

    const role = String(membership.get('role') || '').trim()
    if (!membership.exists || (role !== 'user' && role !== 'admin')) {
      fail(409, 'A valid Interlaken Essen membership is required.')
    }

    const appStateData = {
      profile_kind: MARKETPLACE_PROFILE_KIND,
      app_id: appId,
      locality: {
        id: input.locality_id,
        label: input.locality_label,
        postal_code: input.postal_code,
      },
      offers_enabled: input.offers_enabled,
      ...(input.offers_enabled
        ? {
            public_name: input.public_name,
            introduction: input.introduction,
          }
        : appState.exists
          ? {
              public_name: FieldValue.delete(),
              introduction: FieldValue.delete(),
            }
          : {}),
      ...(!appState.exists
        ? { created: serverAuditStamp({ by: uid, appId }) }
        : {}),
      updated: serverAuditStamp({ by: uid }),
    }

    if (!profile.exists) {
      transaction.create(profileRef, {
        kind: MARKETPLACE_PROFILE_KIND,
        created: serverAuditStamp({ by: uid }),
        updated: serverAuditStamp({ by: uid }),
      })
    }
    transaction.set(appStateRef, appStateData, { merge: true })
    transaction.update(membershipRef, {
      onboarding_status: 'completed',
      updated: serverAuditStamp({ by: uid }),
    })
  })

  return {
    ok: true,
    onboarding_status: 'completed' as const,
  }
})
