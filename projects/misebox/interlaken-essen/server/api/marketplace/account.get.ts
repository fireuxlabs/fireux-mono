import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { useRuntimeConfig } from '#imports'
import { createError } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import {
  INTERLAKEN_ESSEN_APP_ID,
  INTERLAKEN_LOCALITIES,
  OTHER_LOCALITY_ID,
  marketplaceProfileAppStatePath,
  type MarketplaceAccountSettings,
  type MarketplaceAccountResponse,
  type MarketplaceProfile,
} from '../../../app/content/marketplace-profile'

function fail(statusCode: number, statusMessage: string): never {
  throw createError({ statusCode, statusMessage })
}

function profileText(value: unknown, label: string, max: number) {
  if (value === undefined) return ''
  if (typeof value !== 'string' || value.length > max)
    fail(500, `The saved ${label} is invalid.`)
  return value.trim()
}

export default defineLiveReadHandler(async (event) => {
  const runtime = useRuntimeConfig(event)
  const appId = String(runtime.public?.fireux?.id || '').trim()
  if (appId !== INTERLAKEN_ESSEN_APP_ID) {
    fail(500, 'The Interlaken Essen runtime identity is not configured.')
  }

  const { uid } = await requireFirebaseBearerUser(event)
  const db = getRuntimeFirestore()
  const [membership, profile] = await Promise.all([
    db.doc(`apps/${appId}/${'users'}/${uid}`).get(),
    db.doc(marketplaceProfileAppStatePath(uid)).get(),
  ])

  const role = String(membership.get('role') || '').trim()
  if (!membership.exists || (role !== 'user' && role !== 'admin')) {
    fail(403, 'A valid Interlaken Essen membership is required.')
  }

  const storedAddress = profile.get('delivery_address')
  const storedOffersEnabled = profile.get('offers_enabled')
  if (
    storedAddress !== undefined &&
    (typeof storedAddress !== 'string' || storedAddress.length > 500)
  ) {
    fail(500, 'The saved delivery address is invalid.')
  }
  if (
    storedOffersEnabled !== undefined &&
    typeof storedOffersEnabled !== 'boolean'
  ) {
    fail(500, 'The saved offer preference is invalid.')
  }

  const settings: MarketplaceAccountSettings = {
    delivery_address:
      typeof storedAddress === 'string' ? storedAddress.trim() : '',
  }
  const storedLocality = profile.get('locality')
  if (
    storedLocality !== undefined &&
    (!storedLocality ||
      typeof storedLocality !== 'object' ||
      Array.isArray(storedLocality))
  )
    fail(500, 'The saved local area is invalid.')
  const localityId = profileText(storedLocality?.id, 'local area', 40)
  if (
    localityId &&
    localityId !== OTHER_LOCALITY_ID &&
    !INTERLAKEN_LOCALITIES.some((locality) => locality.id === localityId)
  )
    fail(500, 'The saved local area is not supported.')
  const savedProfile: MarketplaceProfile = {
    locality_id: localityId as MarketplaceProfile['locality_id'],
    locality_label: profileText(storedLocality?.label, 'local area', 80),
    postal_code: profileText(storedLocality?.postal_code, 'postal code', 4),
    offers_enabled: storedOffersEnabled === true,
    public_name: profileText(profile.get('public_name'), 'offer name', 80),
    introduction: profileText(profile.get('introduction'), 'introduction', 280),
  }

  return {
    ok: true,
    settings,
    profile: savedProfile,
  } satisfies MarketplaceAccountResponse
})
