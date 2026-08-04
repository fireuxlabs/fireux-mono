import { useRuntimeConfig } from '#imports'
import { createError, type H3Event } from 'h3'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'

export type MarketplaceServerScope = {
  appId: string
  ecosystemId: string
  databaseId: string
  currencyCode: 'CHF'
}

const text = (value: unknown) => String(value ?? '').trim()

export function readMarketplaceServerScope(
  event: H3Event
): MarketplaceServerScope {
  const runtime = useRuntimeConfig(event)
  const fireux = (runtime.public?.fireux ?? {}) as Record<string, unknown>
  const firebase = (runtime.public?.firebaseEcosystem?.firebase ?? {}) as Record<
    string,
    unknown
  >
  const marketplace = (fireux.marketplace ?? {}) as Record<string, unknown>
  const appId = requireFirestoreDocumentId(fireux.id, 'Runtime App id')
  const databaseId = text(firebase.databaseId)

  if (!databaseId || marketplace.enabled === false) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Marketplace runtime authority is not configured.',
    })
  }
  if (marketplace.currencyCode && marketplace.currencyCode !== 'CHF') {
    throw createError({
      statusCode: 500,
      statusMessage: 'Marketplace currency must be CHF.',
    })
  }

  return {
    appId,
    ecosystemId: text(fireux.ecosystemId),
    databaseId,
    currencyCode: 'CHF',
  }
}
