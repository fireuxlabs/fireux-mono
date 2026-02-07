<!-- FILE: packages/extensions/fireux-products/src/runtime/pages/admin/products/create.vue -->
<template>
  <UPage>
    <UPageHeader
      title="Create Product"
      description="Add a new product to the catalog for this runtime."
    />

    <UPageBody class="pagebody">
      <div v-if="permissionsPending" class="space-y-3">
        <USkeleton v-for="n in 3" :key="n" class="h-20" />
      </div>

      <UAlert
        v-else-if="!canManageProducts"
        color="amber"
        title="Admins only"
        description="Only admins can publish products for this runtime."
      />

      <MoleculesCreateShell
        v-else
        :loading="isCreating"
        submit-label="Create FireUX App + Template"
        @submit="handleCreate"
        @clear="handleClear"
      >
        <template #write>
          <ProductCreateWrite />
        </template>
        <template #preview>
          <ProductCreatePreview />
        </template>
      </MoleculesCreateShell>
      <div v-if="isDev" class="mt-6">
        <DevJson
          :title="'Create Product (JSON)'"
          context="admin/products/create"
          :data="devCreateJson"
          :default-open="false"
        />
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { computed, ref } from 'vue'
import { useHead, useRouter } from '#imports'
import { doc, getDoc } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'
import { useProductPermissions } from '../../../composables/useProductPermissions'
import { useFirestore } from 'vuefire'
// Use Nuxt UI toast if available (auto-imported in app)
const useToastFn = (globalThis as any).useToast as undefined | (() => any)
const toast = useToastFn ? useToastFn() : undefined
import {
  useProductCreate,
  useCreateProductState,
  useCreatePricesState,
} from '../../../composables/fireux/firestore/objects/product/useProduct'
import type { FirebaseProduct, StripePriceInput } from '../../../models/objects/product.model'

definePageMeta({
  layout: 'dashboard',
  title: 'Create Product',
  requiresAuth: true,
  roles: ['admin'],
})

const { canManageProducts, pending: permissionsPending } =
  useProductPermissions()

useHead({ title: 'Create Product' })

const isCreatingStarterSet = ref(false)
const isCreating = computed(() => isCreatingStarterSet.value)
const { product, resetCreateProductState } = await useCreateProductState()
const { prices, defaultPrice, resetCreatePricesState } = useCreatePricesState()
const { createProductFromInput } = useProductCreate()
const fireux = useFireUXConfig()
const db = useFirestore()
const { getCollectionPath } = useFirestoreManager()
const productsPath = getCollectionPath('products')
const mainImageData = useStorage<string>('createProductMainImageData', '')
const isDev = import.meta.dev
const router = useRouter()
const devCreateJson = computed(() => ({
  product: product.value,
  prices: prices.value,
  defaultPrice: defaultPrice.value,
  mainImageDataLength: mainImageData.value?.length || 0,
}))

async function handleCreate() {
  await handleCreateStarterSet()
}

function buildStarterProducts(): Array<{
  payload: Omit<FirebaseProduct, 'created_at' | 'updated_at' | 'creator_id'>
  priceInputs: StripePriceInput[]
}> {
  const templatePayload = {
    id: 'fireux-template',
    slug: 'fireux-template',
    name: 'FireUX Template',
    tagline: 'A neutral FireUX app starter you run yourself.',
    Q: "I'm a developer. Can I buy a starter and build it myself?",
    A: 'Yes. FireUX Template gives you a runnable neutral app baseline with products and blogs.',
    description: 'A neutral FireUX app starter for self-hosted builds.',
    content:
      '<p>FireUX Template is a developer starter designed to ship fast.</p><p>It includes a neutral FireUX app shape with products and blogs.</p>',
    active: true,
    product_type: 'template',
    main_image: '/img/app/logo.png',
    images: [],
    features: [
      { title: 'Neutral FireUX app starter', available: true },
      { title: 'Products module included', available: true },
      { title: 'Blogs module included', available: true },
      { title: 'Self-hosted control', available: true },
      { title: 'One-time purchase', available: true },
    ],
    prices: [],
    default_price: { id: '', unit_amount: 0 },
    track_stock: false,
    stock: null,
    appId: fireux.appId,
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
  } as Omit<FirebaseProduct, 'created_at' | 'updated_at' | 'creator_id'>

  const fireuxAppPayload = {
    id: 'fireux-app',
    slug: 'fireux-app',
    name: 'FireUX App',
    tagline: 'A professional app, built with FireUX.',
    Q: "I need something professional online that I don't have to maintain. Can you help?",
    A: 'Yes. FireUX App gives you a modern website + installable app (PWA) with products and a blog, hosted and maintained for you.',
    description: 'A professional app, built with FireUX.',
    content:
      '<p>A FireUX App gives your business a professional digital home that works everywhere and is easy to manage.</p><p>You get a fast, modern website and an installable app your customers can use on phone or desktop.</p>',
    active: true,
    product_type: 'saas_app',
    main_image: '/img/app/logo.png',
    images: [],
    features: [
      { title: 'Professional website and app', available: true },
      { title: 'Product catalogue', available: true },
      { title: 'Blog and content publishing', available: true },
      { title: 'Hosting and maintenance', available: true },
      { title: 'Regular updates', available: true },
    ],
    prices: [],
    default_price: { id: '', unit_amount: 0, interval: 'month' },
    track_stock: false,
    stock: null,
    appId: fireux.appId,
    metadata: {
      category: 'app',
      kind: 'saas_app',
      route: { scenario: 1, product: 'FireUX App' },
      ecosystem: 'fireux-fireux',
      pricing: { subscription: { amount: 20, currency: 'CHF', interval: 'month' } },
      delivery: {
        estimated_time: '3–5 days',
        requirements: ['App name', 'Branding (logo, colours)', 'Initial products or content'],
      },
      cta: { label: 'Get started', action: 'contact' },
      status: 'active',
    },
  } as Omit<FirebaseProduct, 'created_at' | 'updated_at' | 'creator_id'>

  return [
    {
      payload: templatePayload,
      priceInputs: [
        {
          currency: 'CHF',
          unit_amount: 9900,
          type: 'one_time',
          billing_scheme: 'per_unit',
          metadata: { kind: 'license' },
        },
      ],
    },
    {
      payload: fireuxAppPayload,
      priceInputs: [
        {
          currency: 'CHF',
          unit_amount: 2000,
          type: 'recurring',
          interval: 'month',
          interval_count: 1,
          billing_scheme: 'per_unit',
          metadata: { kind: 'subscription' },
        },
      ],
    },
  ]
}

async function handleCreateStarterSet() {
  if (isCreatingStarterSet.value) return
  isCreatingStarterSet.value = true
  try {
    const starters = buildStarterProducts()
    const failures: string[] = []
    const created: string[] = []
    const skipped: string[] = []

    for (const starter of starters) {
      const slug = starter.payload.slug
      const existing = await getDoc(doc(db, productsPath, slug))
      if (existing.exists()) {
        skipped.push(slug)
        continue
      }

      const result = await createProductFromInput(starter)
      if (!result.success) {
        failures.push(
          `${starter.payload.slug}: ${result.error || 'Unknown error'}`
        )
      } else {
        created.push(result.id || starter.payload.slug)
      }
    }

    if (failures.length) {
      if (toast)
        toast.add({
          title: 'Starter set partially failed',
          description: failures.join(' | '),
          icon: 'i-heroicons-x-circle',
          color: 'red',
        })
      return
    }

    if (toast)
      toast.add({
        title: 'Starter set created',
        description: `Created: ${created.join(', ')}${
          skipped.length ? ` | Skipped existing: ${skipped.join(', ')}` : ''
        }`,
        icon: 'i-heroicons-check-circle',
        color: 'green',
      })
    await router.push('/admin/products')
  } finally {
    isCreatingStarterSet.value = false
  }
}

function handleClear() {
  if (confirm('Are you sure you want to clear the form?')) {
    resetCreateProductState()
    resetCreatePricesState()
  }
}
</script>
