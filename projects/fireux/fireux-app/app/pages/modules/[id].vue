<!-- Concurrent edit — 2026-07-20 23:34 CEST — Final app CSS pass: semantic colors. -->
<template>
  <UPage>
    <UPageHeader
      :title="moduleTitle"
      :description="moduleTagline"
    />

    <UPageBody class="pagebody space-y-10">
      <div v-if="moduleProduct" class="space-y-8">
        <div class="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
          <UCard>
            <div class="space-y-5">
              <div class="space-y-3">
                <div class="flex flex-wrap items-center gap-2">
                  <UBadge variant="soft" color="primary">Module</UBadge>
                  <UBadge
                    v-if="requiresTemplate"
                    variant="soft"
                    color="neutral"
                  >
                    Requires FireUX Template
                  </UBadge>
                </div>
                <h2 class="text-2xl font-semibold text-highlighted">
                  {{ moduleTitle }}
                </h2>
                <p class="text-sm text-muted">
                  {{ moduleTagline }}
                </p>
              </div>

              <p class="text-base text-toned">
                {{ moduleDescription }}
              </p>

              <div v-if="moduleFeatures.length" class="flex flex-wrap gap-2">
                <UBadge
                  v-for="feature in moduleFeatures"
                  :key="feature"
                  variant="soft"
                  color="neutral"
                  size="sm"
                >
                  {{ feature }}
                </UBadge>
              </div>
            </div>
          </UCard>

          <UCard>
            <div class="space-y-5">
              <div>
                <p class="text-xs uppercase tracking-wide text-muted">
                  One-time module
                </p>
                <div class="text-3xl font-semibold text-highlighted">
                  {{ priceLabel }}
                </div>
              </div>

              <div class="space-y-2">
                <UButton
                  color="primary"
                  :disabled="isBuying"
                  @click="startCheckout"
                >
                  {{ isBuying ? 'Starting checkout...' : 'Add module' }}
                </UButton>
                <p class="text-xs text-muted">
                  {{ ctaHint }}
                </p>
              </div>

              <ProductCardsPreview
                :card="moduleCard"
                :product="moduleProduct"
                :show-body="false"
                :show-badges="false"
              />
            </div>
          </UCard>
        </div>

        <UCard>
          <div class="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
            <div class="space-y-3">
              <div class="text-xs uppercase tracking-wide text-muted">
                Overview
              </div>
              <div v-if="moduleContent" class="text-sm text-toned">
                <div v-html="moduleContent" />
              </div>
              <p v-else class="text-sm text-muted">
                No overview yet.
              </p>
            </div>

            <div class="space-y-3">
              <div class="text-xs uppercase tracking-wide text-muted">
                Questions
              </div>
              <div class="space-y-1">
                <p class="font-medium text-highlighted">{{ moduleQ }}</p>
                <p class="text-sm text-toned">{{ moduleA }}</p>
              </div>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="space-y-1">
              <p class="text-sm font-semibold text-highlighted">
                Roadmap
              </p>
              <p class="text-xs text-muted">
                What exists now and what we are building next.
              </p>
            </div>
          </template>

          <UTimeline :items="timelineItems" />
        </UCard>
      </div>

      <UAlert
        v-else
        color="warning"
        title="Module not found"
        description="This module does not exist yet."
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useProductCollection } from 'fireux-products/runtime/product/composables/useProductCollection'
import { useProductPrices } from 'fireux-products/runtime/product/composables/firestore/price/fetch/useProductPrices'
import { useProductInterface } from 'fireux-products/runtime/product/composables/useProductInterface'
import type { Product } from 'fireux-products/runtime/product/models/product.model'
import type { ProductRead } from 'fireux-products/runtime/product/utils/product'
import { joinProductRead } from 'fireux-products/runtime/product/utils/normalize-product'
import { roadmapBySlug } from '../../content/module-roadmaps'

definePageMeta({
  nav: {
    key: 'modules-view',
    label: 'Module',
    icon: 'i-lucide-puzzle',
    desktop: false,
  },
})

const slug = useRouteParam('id')

const { products } = useProductCollection()
const { fetchProductPrices } = useProductPrices()
const reads = ref<ProductRead[]>([])
watch(
  products,
  async (items) => {
    reads.value = await Promise.all(
      items.map(async (product) =>
        joinProductRead(product, await fetchProductPrices(product.id))
      )
    )
  },
  { immediate: true }
)
const { preview: toCard } = useProductInterface()

const moduleRead = computed(() => {
  const items = reads.value ?? []
  return items.find(({ product }) => {
    const id = String(product.id ?? '').trim()
    const productSlug = String(product.slug ?? '').trim()
    const type = String(product.product_type ?? '').trim()
    return (
      (id === slug.value || productSlug === slug.value) &&
      type === 'module'
    )
  })
})
const moduleProduct = computed(() => moduleRead.value?.product || null)

const moduleTitle = computed(() => moduleProduct.value?.name || 'Module')
const moduleTagline = computed(() => moduleProduct.value?.tagline || 'FireUX module')
const moduleDescription = computed(() => moduleProduct.value?.description || '')
const moduleContent = computed(() =>
  moduleProduct.value?.content ? String(moduleProduct.value.content).trim() : ''
)
const moduleQ = computed(() => moduleProduct.value?.Q || 'Questions')
const moduleA = computed(() => moduleProduct.value?.A || '')
const moduleFeatures = computed(() =>
  moduleProduct.value?.features?.map((feature) => feature.title).filter(Boolean) ?? []
)
const moduleCard = computed(() =>
  toCard(moduleProduct.value as Product, moduleRead.value?.prices || []) ?? {
    id: moduleProduct.value?.id || '',
    to: '',
    avatarUrl: moduleProduct.value?.main_image || '',
    title: moduleTitle.value,
    subtitle: moduleTagline.value,
    name: moduleTitle.value,
    description: moduleDescription.value,
    imageUrl: moduleProduct.value?.main_image || '',
    summary: moduleDescription.value,
    status: String(moduleProduct.value?.product_type || ''),
    badges: [],
  }
)

const priceLabel = computed(() => {
  const price = moduleRead.value?.defaultPrice?.unit_amount
  const currency = moduleRead.value?.defaultPrice?.currency || 'chf'
  if (!price) return 'Custom'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(price / 100)
})
const requiresTemplate = computed(() =>
  moduleProduct.value?.requires_template === true
)
const ctaHint = computed(() =>
  requiresTemplate.value
    ? 'Requires FireUX Template'
    : 'Works with FireUX Template'
)

const timelineItems = computed(
  () => roadmapBySlug[slug.value] ?? []
)

const isBuying = ref(false)
const notify = (title: string, description: string) => {
  const useToastFn = (globalThis as any).useToast as undefined | (() => any)
  const toast = useToastFn ? useToastFn() : undefined
  if (toast) {
    toast.add({
      title,
      description,
      color: 'warning',
      icon: 'i-heroicons-exclamation-triangle',
    })
  } else {
    console.warn(`${title}: ${description}`)
  }
}

function resolveCheckoutPriceId(): string {
  const fallback = String(moduleRead.value?.defaultPrice?.provider_price_id || moduleRead.value?.defaultPrice?.id || '').trim()
  if (!fallback || fallback.startsWith('local_')) return ''
  return fallback
}

async function startCheckout() {
  const product = moduleProduct.value
  const appId = String(
    product?.source_app_id ||
      ''
  ).trim()
  const productId = String(product?.id || '').trim()
  const productSlug = String(product?.slug || '').trim()
  const priceId = resolveCheckoutPriceId()

  if (!appId || !productId || !productSlug) {
    notify('Checkout unavailable', 'Product data is incomplete for checkout.')
    return
  }

  if (!priceId) {
    notify('Checkout unavailable', 'No live Stripe price found for this module yet.')
    return
  }

  isBuying.value = true
  try {
    const response = await $fetch<{ success?: boolean; url?: string }>(
      '/api/stripe/create-checkout-session',
      {
        method: 'POST',
        body: {
          appId,
          productId,
          slug: productSlug,
          priceId,
          mode: 'payment',
        },
      }
    )

    if (response?.success && response?.url) {
      window.location.href = response.url
      return
    }

    notify('Checkout unavailable', 'Unable to start checkout right now.')
  } catch (error) {
    notify('Checkout unavailable', 'Unable to start checkout right now.')
    console.error('[fireux-products] checkout failed', error)
  } finally {
    isBuying.value = false
  }
}
</script>
