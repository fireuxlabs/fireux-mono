<!-- Concurrent edit — 2026-07-20 23:34 CEST — Final app CSS pass: semantic colors. -->
<template>
  <UPage>
    <UPageHeader :title="moduleTitle" :description="moduleTagline" />

    <UPageBody class="pagebody">
      <div v-if="moduleProduct" class="pagebody">
        <div class="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
          <UCard>
            <div class="fx-card-body-stack">
              <div class="fx-card-body-stack">
                <div class="card__badges">
                  <UBadge variant="soft" color="primary">Module</UBadge>
                  <UBadge
                    v-if="requiresTemplate"
                    variant="soft"
                    color="neutral"
                  >
                    Requires FireUX Template
                  </UBadge>
                </div>
                <h2 class="fx-type-section-title">
                  {{ moduleTitle }}
                </h2>
                <p class="fx-type-caption">
                  {{ moduleTagline }}
                </p>
              </div>

              <p class="fx-type-body">
                {{ moduleDescription }}
              </p>

              <div v-if="moduleFeatures.length" class="card__badges">
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
            <div class="fx-card-body-stack">
              <div>
                <p class="fx-type-caption">One-time module</p>
                <div>
                  {{ priceLabel }}
                </div>
              </div>

              <div class="fx-card-body-stack">
                <UButton
                  color="primary"
                  :disabled="isBuying"
                  @click="startCheckout"
                >
                  {{ isBuying ? 'Starting checkout...' : 'Add module' }}
                </UButton>
                <p class="fx-type-caption">
                  {{ ctaHint }}
                </p>
              </div>

              <ProductCardsSummary
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
            <div class="fx-card-body-stack">
              <div>Overview</div>
              <div v-if="moduleContent">
                <div v-html="moduleContent" />
              </div>
              <p v-else class="fx-type-caption">No overview yet.</p>
            </div>

            <div class="fx-card-body-stack">
              <div>Questions</div>
              <div class="fx-card-body-stack">
                <p class="fx-type-body">{{ moduleQ }}</p>
                <p class="fx-type-caption">{{ moduleA }}</p>
              </div>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="fx-card-body-stack">
              <p class="fx-type-caption">Roadmap</p>
              <p class="fx-type-caption">
                What exists now and what we are building next.
              </p>
            </div>
          </template>

          <UTimeline :items="timelineItems" />
        </UCard>
      </div>

      <FireCopyError v-else-if="error" :message="String(error)" />
      <p v-else-if="pending" role="status">Loading Module…</p>
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
import { computed, ref } from 'vue'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useProductRecord } from 'fireux-products/runtime/product/composables/useProductRecord'
import { useProductInterface } from 'fireux-products/runtime/product/composables/useProductInterface'
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

const {
  read: moduleRead,
  pending,
  error,
} = useProductRecord(slug, { productType: 'module' })
const { preview: toCard } = useProductInterface()

const moduleProduct = computed(() => moduleRead.value?.product || null)

const moduleTitle = computed(() => moduleProduct.value?.name || 'Module')
const moduleTagline = computed(
  () => moduleProduct.value?.tagline || 'FireUX module'
)
const moduleDescription = computed(() => moduleProduct.value?.description || '')
const moduleContent = computed(() =>
  moduleProduct.value?.content ? String(moduleProduct.value.content).trim() : ''
)
const moduleQ = computed(() => moduleProduct.value?.Q || 'Questions')
const moduleA = computed(() => moduleProduct.value?.A || '')
const moduleFeatures = computed(
  () =>
    moduleProduct.value?.features
      ?.map((feature) => feature.title)
      .filter(Boolean) ?? []
)
const moduleCard = computed(
  () =>
    toCard(moduleProduct.value) ?? {
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
const requiresTemplate = computed(
  () => moduleProduct.value?.requires_template === true
)
const ctaHint = computed(() =>
  requiresTemplate.value
    ? 'Requires FireUX Template'
    : 'Works with FireUX Template'
)

const timelineItems = computed(() => roadmapBySlug[slug.value] ?? [])

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
  const fallback = String(
    moduleRead.value?.defaultPrice?.provider_price_id ||
      moduleRead.value?.defaultPrice?.id ||
      ''
  ).trim()
  if (!fallback || fallback.startsWith('local_')) return ''
  return fallback
}

async function startCheckout() {
  const product = moduleProduct.value
  const appId = String(product?.source_app_id || '').trim()
  const productId = String(product?.id || '').trim()
  const productSlug = String(product?.slug || '').trim()
  const priceId = resolveCheckoutPriceId()

  if (!appId || !productId || !productSlug) {
    notify('Checkout unavailable', 'Product data is incomplete for checkout.')
    return
  }

  if (!priceId) {
    notify(
      'Checkout unavailable',
      'No live Stripe price found for this module yet.'
    )
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
