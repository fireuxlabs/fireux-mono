import { createRequire } from 'node:module'
import { createError } from 'h3'
import { STRIPE_API_VERSION } from '../integration/stripe/version'
import type { ProductCreateInput, StripePriceInput } from '../../utils/product'

export function productProvisionProvider() {
  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret) throw createError({ statusCode: 501, statusMessage: 'Stripe is not configured.' })
  let Stripe
  try { const imported = createRequire(import.meta.url)('stripe'); Stripe = imported.default ?? imported } catch { throw createError({ statusCode: 501, statusMessage: 'Stripe SDK is not installed.' }) }
  const stripe = new Stripe(secret, { apiVersion: STRIPE_API_VERSION })
  const verified = (item: { id: string; metadata?: Record<string,string>; deleted?: boolean }, fingerprint: string) => {
    if (item.deleted || item.metadata?.fireux_create !== fingerprint) throw createError({ statusCode: 409, statusMessage: 'Provider ownership requires reconciliation.' })
    return item.id
  }
  return {
    async product(payload: ProductCreateInput, fingerprint: string, key: string, existingId?: string) {
      const item = existingId ? await stripe.products.retrieve(existingId) : await stripe.products.create({name:payload.name,description:payload.description,metadata:{source_app_id:payload.source_app_id,slug:payload.slug,fireux_create:fingerprint}}, {idempotencyKey:key})
      return verified(item,fingerprint)
    },
    async price(productId:string,input:StripePriceInput,fingerprint:string,key:string,existingId?:string) {
      const item=existingId?await stripe.prices.retrieve(existingId):await stripe.prices.create({product:productId,unit_amount:input.unit_amount,currency:input.currency,billing_scheme:input.billing_scheme,metadata:{...input.metadata,fireux_create:fingerprint},...(input.type==='recurring'?{recurring:{interval:input.interval,interval_count:input.interval_count??1}}:{})},{idempotencyKey:key})
      if(String(item.product)!==productId)throw createError({statusCode:409,statusMessage:'Provider price ownership requires reconciliation.'})
      return verified(item,fingerprint)
    },
  }
}
