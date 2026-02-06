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

const starterName = 'FireUX App'
const starterTagline = 'A professional app, built with FireUX.'
const starterQ = "I need something professional online that I don't have to maintain. Can you help?"
const starterA =
  'Yes. FireUX App gives you a modern website + installable app (PWA) with products and a blog, hosted and maintained for you.'
const starterDescription = 'A professional app, built with FireUX.'
const starterContent = `
<p>A FireUX App gives your business a professional digital home that works everywhere and is easy to manage.</p>
<p>You get a fast, modern website and an installable app that your customers can use on phone or desktop.</p>
<p>You can present your products clearly, publish content, and keep everything up to date without worrying about hosting, updates, or technical maintenance.</p>
`.trim()
const starterFeatures = [
  { title: 'Professional website and app', available: true },
  { title: 'Product catalogue', available: true },
  { title: 'Blog and content publishing', available: true },
  { title: 'Hosting and maintenance', available: true },
  { title: 'Regular updates', available: true },
  { title: 'Setup included this month', available: true },
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
    product_type: 'saas_app',
    features: starterFeatures,
    metadata: {
      category: 'app',
      route: { scenario: 1, product: 'FireUX App' },
      ecosystem: 'fireux-fireux',
      promo: { setup_fee: 'free_this_month' },
      pricing: { subscription: { amount: 20, currency: 'CHF', interval: 'month' } },
      delivery: {
        estimated_time: '3–5 days',
        requirements: ['App name', 'Branding (logo, colours)', 'Initial products or content'],
      },
      cta: { label: 'Get started', action: 'contact' },
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
      product_type: String(current.product_type || defaultKind),
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

    if (!mergedMetadata.category) mergedMetadata.category = 'app'
    if (!mergedMetadata.route) mergedMetadata.route = { scenario: 1, product: 'FireUX App' }
    if (!mergedMetadata.ecosystem) mergedMetadata.ecosystem = 'fireux-fireux'
    if (!mergedMetadata.promo) mergedMetadata.promo = { setup_fee: 'free_this_month' }
    if (!mergedMetadata.pricing) {
      mergedMetadata.pricing = { subscription: { amount: 20, currency: 'CHF', interval: 'month' } }
    }
    if (!mergedMetadata.delivery) {
      mergedMetadata.delivery = {
        estimated_time: '3–5 days',
        requirements: ['App name', 'Branding (logo, colours)', 'Initial products or content'],
      }
    }
    if (!mergedMetadata.cta) mergedMetadata.cta = { label: 'Get started', action: 'contact' }
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
      product_type: current.product_type || 'saas_app',
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
      product_type: 'saas_app',
      features: starterFeatures,
      metadata: {
        category: 'app',
        route: { scenario: 1, product: 'FireUX App' },
        ecosystem: 'fireux-fireux',
        promo: { setup_fee: 'free_this_month' },
        pricing: { subscription: { amount: 20, currency: 'CHF', interval: 'month' } },
        delivery: {
          estimated_time: '3–5 days',
          requirements: ['App name', 'Branding (logo, colours)', 'Initial products or content'],
        },
        cta: { label: 'Get started', action: 'contact' },
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
