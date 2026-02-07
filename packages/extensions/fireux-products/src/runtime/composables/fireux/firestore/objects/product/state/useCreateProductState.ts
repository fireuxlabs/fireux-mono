import { useStorage } from '@vueuse/core'
import { onMounted, ref, watch } from 'vue'
import { useRuntimeConfig } from '#imports'
import { useCurrentUser } from 'vuefire'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import type { FirebaseProduct } from '../../../../../../models/objects/product.model'

type ProductDraft = Partial<FirebaseProduct> & {
  main_image?: string
}

const STORAGE_KEY = 'createProduct'
const IMAGE_KEY = 'createProductMainImageData'

const starterName = 'FireUX Template'
const starterTagline = 'A neutral FireUX app starter you run yourself.'
const starterQ =
  "I'm a developer. Can I buy a starter and build it myself?"
const starterA =
  'Yes. FireUX Template gives you a runnable neutral app baseline with products and blogs.'
const starterDescription = 'A neutral FireUX app starter for self-hosted builds.'
const starterContent = `
<p>FireUX Template is a developer starter designed to ship fast.</p>
<p>It includes a neutral FireUX app shape with products and blogs so you can extend from a proven baseline.</p>
<p>You host and operate it yourself.</p>
`.trim()
const starterFeatures = [
  { title: 'Neutral FireUX app starter', available: true },
  { title: 'Products module included', available: true },
  { title: 'Blogs module included', available: true },
  { title: 'Self-hosted control', available: true },
  { title: 'One-time purchase', available: true },
]

function toSlug(name: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  return base
}

export function useCreateProductState() {
  const currentUser = useCurrentUser()
  const { appId: tenantId } = useFireUXConfig()
  const cfg = (useRuntimeConfig().public as any)?.fireux?.products ?? {}
  const defaultKind =
    Array.isArray(cfg.productKinds) && cfg.productKinds.length
      ? String(cfg.productKinds[0])
      : 'service'
  const starterSlug = toSlug(starterName)
  const mainImageData = useStorage<string>(IMAGE_KEY, '/img/app/logo.png')

  const product = useStorage<ProductDraft>(STORAGE_KEY, {
    id: starterSlug,
    name: starterName,
    tagline: starterTagline,
    Q: starterQ,
    A: starterA,
    description: starterDescription,
    content: starterContent,
    active: true,
    slug: starterSlug,
    product_type: 'template',
    features: starterFeatures,
    metadata: {
      category: 'template',
      kind: 'template',
      route: { scenario: 6, product: 'Templates + Optional Modules' },
      ecosystem: 'fireux-fireux',
      pricing: { one_time: { amount: 99, currency: 'CHF' } },
      delivery: {
        estimated_time: 'Instant',
        requirements: ['Stripe payment', 'Email for repository access'],
      },
      cta: { label: 'Buy template', action: 'checkout' },
      status: 'active',
    },
    appId: tenantId,
    creator_id: currentUser.value?.uid || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  const applyStarterDefaults = () => {
    const current = product.value ?? {}
    const isLegacyEmpty =
      !String(current.name || '').trim() &&
      !String(current.slug || '').trim() &&
      !String(current.id || '').trim()

    if (!isLegacyEmpty) return

    product.value = {
      ...current,
      id: starterSlug,
      name: starterName,
      tagline: starterTagline,
      description: starterDescription,
      content: starterContent,
      slug: starterSlug,
      product_type: String(current.product_type || 'template'),
      active: typeof current.active === 'boolean' ? current.active : true,
      appId: current.appId || tenantId,
      creator_id: current.creator_id || currentUser.value?.uid || '',
      created_at: current.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }

  const backfillStarterDefaults = () => {
    const current = product.value ?? {}
    const mergedMetadata =
      current.metadata && typeof current.metadata === 'object'
        ? { ...current.metadata }
        : {}

    if (!mergedMetadata.category) mergedMetadata.category = 'template'
    if (!mergedMetadata.kind) mergedMetadata.kind = 'template'
    if (!mergedMetadata.route) {
      mergedMetadata.route = { scenario: 6, product: 'Templates + Optional Modules' }
    }
    if (!mergedMetadata.ecosystem) mergedMetadata.ecosystem = 'fireux-fireux'
    if (!mergedMetadata.pricing) mergedMetadata.pricing = { one_time: { amount: 99, currency: 'CHF' } }
    if (!mergedMetadata.delivery) {
      mergedMetadata.delivery = {
        estimated_time: 'Instant',
        requirements: ['Stripe payment', 'Email for repository access'],
      }
    }
    if (!mergedMetadata.cta) mergedMetadata.cta = { label: 'Buy template', action: 'checkout' }
    if (!mergedMetadata.status) mergedMetadata.status = 'active'

    product.value = {
      ...current,
      id: current.id || starterSlug,
      name: current.name || starterName,
      tagline: current.tagline || starterTagline,
      Q: current.Q || starterQ,
      A: current.A || starterA,
      description: current.description || starterDescription,
      content: current.content || starterContent,
      slug: current.slug || starterSlug,
      product_type: current.product_type || 'template',
      features: Array.isArray(current.features) && current.features.length
        ? current.features
        : starterFeatures,
      metadata: mergedMetadata,
      active: typeof current.active === 'boolean' ? current.active : true,
      appId: current.appId || tenantId,
      creator_id: current.creator_id || currentUser.value?.uid || '',
      created_at: current.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    if (!mainImageData.value) {
      mainImageData.value = '/img/app/logo.png'
    }
  }

  applyStarterDefaults()
  backfillStarterDefaults()
  const isSlugTaken = ref(false)

  watch(
    () => product.value.name,
    (newName: string | undefined) => {
      if (!newName) {
        product.value.slug = ''
        isSlugTaken.value = false
        return
      }

      const slug = toSlug(newName)
      product.value.slug = slug
      isSlugTaken.value = false
    },
    { immediate: true }
  )

  onMounted(() => {
    applyStarterDefaults()
    backfillStarterDefaults()
    if (currentUser.value?.uid) {
      product.value.creator_id = currentUser.value.uid
    }
    if (tenantId) {
      product.value.appId = tenantId
    }
  })

  function resetCreateProductState() {
    product.value = {
      id: starterSlug,
      name: starterName,
      tagline: starterTagline,
      Q: starterQ,
      A: starterA,
      description: starterDescription,
      content: starterContent,
      active: true,
      slug: starterSlug,
      product_type: 'template',
      features: starterFeatures,
      metadata: {
        category: 'template',
        kind: 'template',
        route: { scenario: 6, product: 'Templates + Optional Modules' },
        ecosystem: 'fireux-fireux',
        pricing: { one_time: { amount: 99, currency: 'CHF' } },
        delivery: {
          estimated_time: 'Instant',
          requirements: ['Stripe payment', 'Email for repository access'],
        },
        cta: { label: 'Buy template', action: 'checkout' },
        status: 'active',
      },
      appId: tenantId,
      creator_id: currentUser.value?.uid || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    mainImageData.value = '/img/app/logo.png'
    isSlugTaken.value = false
  }

  function getProductPayload(): ProductDraft {
    backfillStarterDefaults()
    if (!product.value.name?.trim()) {
      throw new Error('Product name is required')
    }
    if (!product.value.slug?.trim()) {
      throw new Error('Product slug is required')
    }
    return {
      ...product.value,
      main_image: mainImageData.value,
    }
  }

  return {
    product,
    mainImageData,
    isSlugTaken,
    resetCreateProductState,
    getProductPayload,
  }
}
