// Repo-level demo payloads for Products.
// Use these records for dev surfaces, examples, and explicit preflight demos.
// They are not canonical storage or runtime contracts.

import { useProductInterface } from 'fireux-products/runtime/composables/fireux/firestore/product/utils/view/useProductInterface'
import type { FirebaseProduct, ProductPrice } from 'fireux-products/runtime/models/product.model'
import { FirebaseProduct as ProductModelRuntime } from 'fireux-products/runtime/models/product.model'

const createModule = (input: {
  id: string
  slug: string
  name: string
  tagline: string
  question: string
  answer: string
  description: string
  content: string
  price: number
  features: string[]
  packageName: string
  ecosystem: string
  appId: string
}) : FirebaseProduct => {
  const priceId = `manual_${input.id}_one_time`
  const price: ProductPrice = {
    id: priceId,
    product_id: input.slug,
    label: 'Module license',
    currency: 'chf',
    unit_amount: input.price,
    type: 'one_time',
    billing_scheme: 'per_unit',
    active: true,
    default: true,
    provider: 'manual',
    provider_price_id: '',
    metadata: {
      kind: 'module_license',
      demo: true,
    },
  }

  return {
    ...ProductModelRuntime,
    id: input.slug,
    slug: input.slug,
    source_app_id: input.appId,
    source_ecosystem_id: input.ecosystem,
    owner_type: 'app',
    owner_id: input.appId,
    visibility: 'public',
    name: input.name,
    tagline: input.tagline,
    Q: input.question,
    A: input.answer,
    description: input.description,
    content: input.content.trim(),
    active: true,
    product_type: 'module',
    main_image: '/img/app/logo.png',
    images: [],
    prices: [price],
    default_price: {
      id: priceId,
      unit_amount: input.price,
    },
    features: input.features.map((title) => ({ title, available: true })),
    metadata: {
      category: 'module',
      kind: 'module',
      module: { package: input.packageName, scope: 'template-only', requires: [] },
      availability: { requires_template: true },
      route: { scenario: 6, product: 'Modules' },
      ecosystem: input.ecosystem,
      pricing: { one_time: { amount: input.price / 100, currency: 'chf' } },
      delivery: {
        estimated_time: 'Instant',
        requirements: ['Template installed'],
      },
      cta: { label: 'Add module', action: 'checkout' },
      status: 'active',
      stripe: { product_id: '', price_ids: [], configured: false },
    },
  }
}

export const demoProductList: FirebaseProduct[] = [
  createModule({
    id: 'northstar-rank-kit',
    slug: 'northstar-rank-kit',
    name: 'Northstar Rank Kit',
    tagline: 'SEO audits, opportunity maps, and search reporting.',
    question: 'Can we show a realistic SEO workflow in demos?',
    answer: 'Yes. Northstar Rank Kit covers audit flows, keyword planning, and search visibility reporting.',
    description: 'SEO workspace add-on for audits, keyword strategy, and visibility planning.',
    content: `
Northstar Rank Kit supports SEO demos with structured audit workflows,
keyword planning, reporting, and opportunity tracking.
    `,
    price: 1200,
    features: ['Audit workflows', 'Keyword planning views', 'Search visibility reporting'],
    packageName: 'northstar-rank-kit',
    ecosystem: 'northstar',
    appId: 'rank-lens',
  }),
  createModule({
    id: 'northstar-content-kit',
    slug: 'northstar-content-kit',
    name: 'Northstar Content Kit',
    tagline: 'Editorial planning and publishing handoff.',
    question: 'Can we pair SEO planning with content delivery?',
    answer: 'Yes. Northstar Content Kit covers briefs, calendars, and publishing handoff.',
    description: 'Content operations add-on for briefs, calendars, and editorial execution.',
    content: `
Northstar Content Kit gives the shared scenario world a clean editorial lane with
briefing, planning, and content handoff surfaces.
    `,
    price: 1000,
    features: ['Brief templates', 'Content calendar views', 'Publishing handoff'],
    packageName: 'northstar-content-kit',
    ecosystem: 'northstar',
    appId: 'content-flow',
  }),
  createModule({
    id: 'harbor-service-kit',
    slug: 'harbor-service-kit',
    name: 'Harbor Service Kit',
    tagline: 'Kitchen execution, prep cadence, and station rhythm.',
    question: 'Can we show a fast-moving kitchen ops system?',
    answer: 'Yes. Harbor Service Kit covers prep, stations, dishes, and service flows.',
    description: 'Hospitality operations add-on for kitchens, prep, and service execution.',
    content: `
Harbor Service Kit is the hospitality lane for the shared scenario world.
It is built around prep coordination, station clarity, and service rhythm.
    `,
    price: 1200,
    features: ['Station workflow', 'Prep and mise views', 'Service-ready menu structures'],
    packageName: 'harbor-service-kit',
    ecosystem: 'harbor',
    appId: 'line-pass',
  }),
  createModule({
    id: 'cedar-portfolio-kit',
    slug: 'cedar-portfolio-kit',
    name: 'Cedar Portfolio Kit',
    tagline: 'Portfolio oversight, finance signals, and incident visibility.',
    question: 'Can we show property operations without using real brands?',
    answer: 'Yes. Cedar Portfolio Kit covers portfolios, incidents, documents, and finance views.',
    description: 'Property operations add-on for portfolio oversight and reporting.',
    content: `
Cedar Portfolio Kit anchors the property lane with portfolio, finance,
incident, and document workflows.
    `,
    price: 1100,
    features: ['Portfolio summary views', 'Incident tracking', 'Finance and compliance surfaces'],
    packageName: 'cedar-portfolio-kit',
    ecosystem: 'cedar',
    appId: 'lease-board',
  }),
  createModule({
    id: 'cedar-site-kit',
    slug: 'cedar-site-kit',
    name: 'Cedar Site Kit',
    tagline: 'Site records, place context, and operational notes.',
    question: 'Can we pair portfolio views with site-level records?',
    answer: 'Yes. Cedar Site Kit covers location records, notes, and on-site operational context.',
    description: 'Site operations add-on for place records and property context.',
    content: `
Cedar Site Kit rounds out the property lane with site and place context,
so the shared scenario world can connect portfolio views to real locations.
    `,
    price: 900,
    features: ['Site records', 'Operational notes', 'Location context views'],
    packageName: 'cedar-site-kit',
    ecosystem: 'cedar',
    appId: 'site-ledger',
  }),
]

const { interface: productInterface } = useProductInterface()

export const demoProductSurfaceList = demoProductList
  .map((product) => {
    const mapped = productInterface(product)
    return mapped ? { product, card: mapped } : null
  })
  .filter(
    (
      surface
    ): surface is { product: FirebaseProduct; card: NonNullable<ReturnType<typeof productInterface>> } =>
      Boolean(surface)
  )

export const demoProductSurface = demoProductSurfaceList[0] ?? null
