import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { useRuntimeConfig } from '#imports'
import { createError } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import {
  INTERLAKEN_ESSEN_APP_ID,
  marketplaceProfileAppStatePath,
  type MarketplaceAccountSettings,
  type MarketplaceAccountResponse,
  type MarketplaceOnboardingStatus,
} from '../../../app/content/marketplace-profile'

function fail(statusCode: number, statusMessage: string): never {
  throw createError({ statusCode, statusMessage })
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
    fail(500, 'The saved seller access is invalid.')
  }

  const settings: MarketplaceAccountSettings = {
    delivery_address:
      typeof storedAddress === 'string' ? storedAddress.trim() : '',
  }
  const storedOnboardingStatus = membership.get('onboarding_status')
  const onboardingStatus: MarketplaceOnboardingStatus =
    storedOnboardingStatus === 'completed' ||
    storedOnboardingStatus === 'skipped'
      ? storedOnboardingStatus
      : 'pending'

  return {
    ok: true,
    settings,
    access: {
      seller_enabled: storedOffersEnabled === true,
    },
    membership: {
      onboarding_status: onboardingStatus,
    },
  } satisfies MarketplaceAccountResponse
})
