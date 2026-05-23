#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { createRequire } from 'node:module'
import { readFile } from 'node:fs/promises'
import { parseArgs } from './_lib/args.mjs'

const args = parseArgs(process.argv.slice(2))

const DEFAULT_SERVICE_ACCOUNT =
  'packages/ecosystem/fireux-fireux/src/config/firebase/service-account.json'
const DEFAULT_ENV_PATH = 'projects/fireux/go-qr/.env'

const commit = Boolean(args.commit)
const allowLive = Boolean(args['allow-live'])
const serviceAccountPath = String(args['service-account'] || DEFAULT_SERVICE_ACCOUNT).trim()
const envPath = String(args.env || DEFAULT_ENV_PATH).trim()
const databaseId = String(args.database || 'go-qr').trim()
const appId = 'go-qr'
const ecosystemId = 'fireux'
const productId = 'doc-upload'
const priceLabel = 'Per document'
const unitAmount = 100
const currency = 'usd'
const goQrRequire = createRequire(
  new URL('../projects/fireux/go-qr/package.json', import.meta.url)
)

const env = await readEnvFile(envPath)
const stripeSecretKey = firstString(process.env.STRIPE_SECRET_KEY, env.STRIPE_SECRET_KEY)

if (!stripeSecretKey) {
  console.error(
    [
      '[go-qr-doc-upload] Missing STRIPE_SECRET_KEY.',
      `Add a Stripe test secret key to ${envPath}, then rerun:`,
      '  node scripts/seed-go-qr-doc-upload-product.mjs --commit',
    ].join('\n')
  )
  process.exit(2)
}

if (stripeSecretKey.startsWith('sk_live_') && !allowLive) {
  console.error(
    [
      '[go-qr-doc-upload] Refusing to use a live Stripe key by default.',
      'Use a Stripe test key first, or pass --allow-live intentionally.',
    ].join('\n')
  )
  process.exit(2)
}

const rawServiceAccount = await readFile(serviceAccountPath, 'utf8')
const serviceAccount = JSON.parse(rawServiceAccount)
const projectId = String(args.project || serviceAccount.project_id || '').trim()

if (!projectId) {
  console.error('[go-qr-doc-upload] Could not resolve Firebase project id.')
  process.exit(2)
}

const adminApp = initializeApp({
  credential: cert(serviceAccount),
  projectId,
})

const db = databaseId ? getFirestore(adminApp, databaseId) : getFirestore(adminApp)
const Stripe = goQrRequire('stripe')
const stripe = new Stripe(stripeSecretKey)

const stripeProduct = await findOrCreateStripeProduct()
const stripePrice = await findOrCreateStripePrice(stripeProduct.id)

const productRef = db.collection('products').doc(productId)
const priceRef = productRef.collection('prices').doc(stripePrice.id)
const productSnap = await productRef.get()
const priceSnap = await priceRef.get()

const priceRecord = {
  id: stripePrice.id,
  product_id: productId,
  label: priceLabel,
  currency,
  unit_amount: unitAmount,
  type: 'one_time',
  billing_scheme: 'per_unit',
  active: true,
  default: true,
  provider: 'stripe',
  provider_price_id: stripePrice.id,
  metadata: {
    stripe_product_id: stripeProduct.id,
    app_id: appId,
    slug: productId,
    usage_unit: 'document',
  },
  ...(priceSnap.exists
    ? {
        updated: {
          at: FieldValue.serverTimestamp(),
          by: 'scripts/seed-go-qr-doc-upload-product',
        },
      }
    : {
        created: {
          at: FieldValue.serverTimestamp(),
          by: 'scripts/seed-go-qr-doc-upload-product',
          app_id: appId,
        },
        updated: {
          at: FieldValue.serverTimestamp(),
          by: 'scripts/seed-go-qr-doc-upload-product',
        },
      }),
}

const embeddedPriceRecord = {
  id: stripePrice.id,
  product_id: productId,
  label: priceLabel,
  currency,
  unit_amount: unitAmount,
  type: 'one_time',
  billing_scheme: 'per_unit',
  active: true,
  default: true,
  provider: 'stripe',
  provider_price_id: stripePrice.id,
  metadata: {
    stripe_product_id: stripeProduct.id,
    app_id: appId,
    slug: productId,
    usage_unit: 'document',
  },
}

const productRecord = {
  id: productId,
  source_app_id: appId,
  source_ecosystem_id: ecosystemId,
  owner_type: 'app',
  owner_id: appId,
  visibility: 'app',
  name: 'Doc Upload',
  tagline: 'Upload a document. Get a public URL and QR code.',
  Q: '',
  A: '',
  description:
    'Upload one document, create a public URL, and get a QR code.',
  content:
    'Anonymous users can create one small document proof. Extra documents require an account.',
  slug: productId,
  active: true,
  main_image: '',
  images: [],
  features: [],
  prices: [embeddedPriceRecord],
  default_price: {
    id: stripePrice.id,
    unit_amount: unitAmount,
  },
  product_type: 'service',
  track_stock: false,
  stock: null,
  metadata: {
    go_qr: {
      product_key: 'doc_upload',
      anonymous_limit: 1,
      max_pages: 5,
      max_file_size_mb: 10,
      ai_processing_optional: true,
    },
    stripe: {
      product_id: stripeProduct.id,
      price_ids: [stripePrice.id],
      configured: true,
    },
  },
  ...(productSnap.exists
    ? {
        updated: {
          at: FieldValue.serverTimestamp(),
          by: 'scripts/seed-go-qr-doc-upload-product',
        },
      }
    : {
        created: {
          at: FieldValue.serverTimestamp(),
          by: 'scripts/seed-go-qr-doc-upload-product',
          app_id: appId,
        },
        updated: {
          at: FieldValue.serverTimestamp(),
          by: 'scripts/seed-go-qr-doc-upload-product',
        },
      }),
}

const summary = {
  ok: true,
  mode: commit ? 'commit' : 'dry-run',
  projectId,
  databaseId,
  paths: {
    product: productRef.path,
    price: priceRef.path,
  },
  stripe: {
    mode: stripeSecretKey.startsWith('sk_live_') ? 'live' : 'test',
    productId: stripeProduct.id,
    priceId: stripePrice.id,
    currency,
    unitAmount,
  },
  changes: {
    product: productSnap.exists ? 'merge' : 'create',
    price: priceSnap.exists ? 'merge' : 'create',
  },
}

if (!commit) {
  console.log(JSON.stringify(summary, null, 2))
  process.exit(0)
}

const batch = db.batch()
batch.set(productRef, productRecord, { merge: true })
batch.set(priceRef, priceRecord, { merge: true })
await batch.commit()

console.log(JSON.stringify(summary, null, 2))

async function findOrCreateStripeProduct() {
  const existing = await findStripeProduct()
  if (existing) return existing

  return stripe.products.create(
    {
      name: 'Doc Upload',
      description: 'Upload a document, create a public URL, and generate a QR code.',
      active: true,
      metadata: {
        source_app_id: appId,
        appId,
        slug: productId,
        product_key: 'doc_upload',
      },
    },
    { idempotencyKey: `go-qr:products:${productId}` }
  )
}

async function findStripeProduct() {
  let startingAfter
  for (let pageIndex = 0; pageIndex < 20; pageIndex += 1) {
    const page = await stripe.products.list({
      active: true,
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    })
    const match = page.data.find(
      (product) =>
        product.metadata?.source_app_id === appId &&
        product.metadata?.slug === productId
    )
    if (match) return match
    if (!page.has_more || !page.data.length) return null
    startingAfter = page.data[page.data.length - 1].id
  }
  return null
}

async function findOrCreateStripePrice(stripeProductId) {
  const existing = await findStripePrice(stripeProductId)
  if (existing) return existing

  return stripe.prices.create(
    {
      product: stripeProductId,
      unit_amount: unitAmount,
      currency,
      billing_scheme: 'per_unit',
      metadata: {
        source_app_id: appId,
        slug: productId,
        label: priceLabel,
        usage_unit: 'document',
      },
    },
    { idempotencyKey: `go-qr:prices:${productId}:${currency}:${unitAmount}` }
  )
}

async function findStripePrice(stripeProductId) {
  const page = await stripe.prices.list({
    active: true,
    product: stripeProductId,
    limit: 100,
  })
  return (
    page.data.find(
      (price) =>
        price.currency === currency &&
        price.unit_amount === unitAmount &&
        !price.recurring
    ) || null
  )
}

async function readEnvFile(path) {
  try {
    const raw = await readFile(path, 'utf8')
    const entries = raw
      .split(/\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => !line.startsWith('#'))
      .map((line) => {
        const index = line.indexOf('=')
        if (index < 0) return [line, '']
        return [line.slice(0, index), line.slice(index + 1)]
      })
    return Object.fromEntries(entries)
  } catch {
    return {}
  }
}

function firstString(...values) {
  for (const value of values) {
    if (typeof value !== 'string') continue
    const trimmed = value.trim()
    if (trimmed) return trimmed
  }
  return ''
}
