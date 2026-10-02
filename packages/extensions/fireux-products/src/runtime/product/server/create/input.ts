import { createError } from 'h3'
import { validatePublicSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug'
import type { ProductCreateInput, StripePriceInput } from '../../utils/product'
export function invalidProductInput(): never { throw createError({ statusCode: 400, statusMessage: 'Invalid Product creation input.' }) }
function fields(input: unknown, allowed: string[]) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) invalidProductInput()
  const value = input as Record<string, unknown>
  if (Object.keys(value).some(key => !allowed.includes(key))) invalidProductInput()
  return value
}
const text = (value: unknown, fallback = '') => { if (value === undefined) return fallback; if (typeof value !== 'string') invalidProductInput(); return value.trim() }
export function readProductCreateInput(input: unknown, appId: string) {
  const envelope = fields(input, ['requestId', 'payload', 'priceInputs'])
  const requestId = text(envelope.requestId)
  if (!/^[a-zA-Z0-9-]{1,100}$/.test(requestId)) invalidProductInput()
  const value = fields(envelope.payload, ['source_app_id','visibility','name','tagline','Q','A','description','content','slug','active','main_image','images','features','categories','brands','source_url','requires_template','fulfillment_requirements','product_type'])
  if (value.source_app_id !== undefined && value.source_app_id !== appId) invalidProductInput()
  const slug = validatePublicSlug(value.slug, { label: 'Product slug', namespace: 'products', reservedScope: 'entity' })
  if (!slug.isValid || !text(value.name)) invalidProductInput()
  for (const key of ['active','requires_template']) if (value[key] !== undefined && typeof value[key] !== 'boolean') invalidProductInput()
  if (value.visibility !== undefined && !['app','public'].includes(String(value.visibility))) invalidProductInput()
  const stringArray = (key: string) => { const entries = value[key] ?? []; if (!Array.isArray(entries) || entries.some(x => typeof x !== 'string')) invalidProductInput(); return entries.map(x => x.trim()) }
  const images = value.images ?? [], features = value.features ?? []
  if (!Array.isArray(images) || !Array.isArray(features)) invalidProductInput()
  const payload: ProductCreateInput = {
    source_app_id: appId, visibility: value.visibility === 'public' ? 'public' : 'app', name: text(value.name), tagline:text(value.tagline), Q:text(value.Q), A:text(value.A), description:text(value.description), content:text(value.content), slug:slug.slug, active:value.active !== false, main_image:text(value.main_image),
    images: images.map(entry => { const v=fields(entry,['url','alt','order']); if(v.order!==undefined && (!Number.isFinite(v.order) || typeof v.order!=='number')) invalidProductInput(); return {url:text(v.url),...(v.alt!==undefined?{alt:text(v.alt)}:{}),...(v.order!==undefined?{order:v.order as number}:{})} }),
    features: features.map(entry => {const v=fields(entry,['title','description','available']);if(typeof v.available!=='boolean')invalidProductInput();return{title:text(v.title),...(v.description!==undefined?{description:text(v.description)}:{}),available:v.available}}),
    categories:stringArray('categories'),brands:stringArray('brands'),source_url:text(value.source_url),requires_template:value.requires_template===true,fulfillment_requirements:stringArray('fulfillment_requirements'),product_type:text(value.product_type),
  }
  if (!Array.isArray(envelope.priceInputs) || !envelope.priceInputs.length) invalidProductInput()
  const prices: StripePriceInput[] = envelope.priceInputs.map(entry => {
    const v=fields(entry,['currency','unit_amount','type','interval','interval_count','billing_scheme','metadata'])
    const currency=text(v.currency,'usd').toLowerCase(),type=v.type??'one_time',billing_scheme=v.billing_scheme??'per_unit'
    if(!/^[a-z]{3}$/.test(currency)||!Number.isSafeInteger(v.unit_amount)||(v.unit_amount as number)<0||!['one_time','recurring'].includes(String(type))||!['per_unit','tiered'].includes(String(billing_scheme)))invalidProductInput()
    const metadata=v.metadata??{};if(!metadata||typeof metadata!=='object'||Array.isArray(metadata)||Object.values(metadata).some(x=>typeof x!=='string'))invalidProductInput()
    if(type==='recurring'&&(!['day','week','month','year'].includes(String(v.interval))||(v.interval_count!==undefined&&(!Number.isSafeInteger(v.interval_count)||(v.interval_count as number)<1))))invalidProductInput()
    return{currency,unit_amount:v.unit_amount as number,type:type as StripePriceInput['type'],billing_scheme:billing_scheme as StripePriceInput['billing_scheme'],metadata:metadata as Record<string,string>,...(type==='recurring'?{interval:v.interval as StripePriceInput['interval'],interval_count:(v.interval_count??1) as number}:{})}
  })
  return { requestId, payload, prices }
}
