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
                <h2 class="text-2xl font-semibold text-foreground">
                  {{ moduleTitle }}
                </h2>
                <p class="text-sm text-muted-foreground">
                  {{ moduleTagline }}
                </p>
              </div>

              <p class="text-base text-muted-foreground">
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
                <p class="text-xs uppercase tracking-wide text-muted-foreground">
                  One-time module
                </p>
                <div class="text-3xl font-semibold text-foreground">
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
                <p class="text-xs text-muted-foreground">
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
              <div class="text-xs uppercase tracking-wide text-muted-foreground">
                Overview
              </div>
              <div v-if="moduleContent" class="text-sm text-muted-foreground">
                <div v-html="moduleContent" />
              </div>
              <p v-else class="text-sm text-muted-foreground">
                No overview yet.
              </p>
            </div>

            <div class="space-y-3">
              <div class="text-xs uppercase tracking-wide text-muted-foreground">
                Questions
              </div>
              <div class="space-y-1">
                <p class="font-medium text-foreground">{{ moduleQ }}</p>
                <p class="text-sm text-muted-foreground">{{ moduleA }}</p>
              </div>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="space-y-1">
              <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Roadmap
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
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
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useProductCollection } from 'fireux-products/runtime/composables/fireux/firestore/product/fetch/useProductCollection'
import { useProductInterface } from 'fireux-products/runtime/composables/fireux/firestore/product/utils/view/useProductInterface'
import type { FirebaseProduct } from 'fireux-products/runtime/models/product.model'

definePageMeta({
  nav: {
    key: 'modules-view',
    label: 'Module',
    icon: 'i-lucide-puzzle',
    desktop: false,
  },
})

const route = useRoute()
const slug = computed(() => String(route.params.id || '').trim())

const { products } = useProductCollection()
const { preview: toCard } = useProductInterface()

const moduleProduct = computed(() => {
  const items = products.value ?? []
  return items.find((product) => {
    const id = String(product.id ?? '').trim()
    const productSlug = String(product.slug ?? '').trim()
    const type = String(product.product_type ?? '').trim()
    const category = String((product as any)?.metadata?.category ?? '').trim()
    return (
      (id === slug.value || productSlug === slug.value) &&
      (type === 'module' || category === 'module')
    )
  })
})

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
  toCard(moduleProduct.value as FirebaseProduct) ?? {
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
  const price = moduleProduct.value?.default_price?.unit_amount
  const currency = moduleProduct.value?.prices?.[0]?.currency || 'chf'
  if (!price) return 'Custom'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(price / 100)
})
const requiresTemplate = computed(() =>
  Boolean((moduleProduct.value as any)?.metadata?.availability?.requires_template)
)
const ctaHint = computed(() =>
  requiresTemplate.value
    ? 'Requires FireUX Template'
    : 'Works with FireUX Template'
)

const roadmapBySlug: Record<
  string,
  { title: string; description: string; icon?: string; color?: string }[]
> = {
  'fireux-kitchens': [
    {
      title: 'Now',
      description: 'Kitchen profile plus menus, ingredients, mise, team, and costs sections.',
      icon: 'i-lucide-check-circle',
      color: 'primary',
    },
    {
      title: 'Next',
      description: 'Structured prep lists, inventory workflows, and kitchen ops tooling.',
      icon: 'i-lucide-clock-3',
      color: 'warning',
    },
    {
      title: 'Later',
      description: 'Station workflows, touch-friendly order handling, and integrations.',
      icon: 'i-lucide-rocket',
      color: 'neutral',
    },
  ],
  'fireux-jobs': [
    {
      title: 'Now',
      description: 'Jobs list/detail pages, create/edit posts, and professional profiles.',
      icon: 'i-lucide-check-circle',
      color: 'primary',
    },
    {
      title: 'Next',
      description: 'Applicant workflow, messaging, and status tracking.',
      icon: 'i-lucide-clock-3',
      color: 'warning',
    },
    {
      title: 'Later',
      description: 'Payments, verified applicants, and advanced analytics.',
      icon: 'i-lucide-rocket',
      color: 'neutral',
    },
  ],
  'fireux-places': [
    {
      title: 'Now',
      description: 'Places list/detail pages plus create/edit flows.',
      icon: 'i-lucide-check-circle',
      color: 'primary',
    },
    {
      title: 'Next',
      description: 'Map views, search filters, and richer discovery.',
      icon: 'i-lucide-clock-3',
      color: 'warning',
    },
    {
      title: 'Later',
      description: 'Multi-location analytics and integrations.',
      icon: 'i-lucide-rocket',
      color: 'neutral',
    },
  ],
  'fireux-companies': [
    {
      title: 'Now',
      description: 'Company list/detail pages plus create/edit flows.',
      icon: 'i-lucide-check-circle',
      color: 'primary',
    },
    {
      title: 'Next',
      description: 'Team pages, org charts, and richer company data.',
      icon: 'i-lucide-clock-3',
      color: 'warning',
    },
    {
      title: 'Later',
      description: 'B2B verification and partner tooling.',
      icon: 'i-lucide-rocket',
      color: 'neutral',
    },
  ],
  'fireux-suppliers': [
    {
      title: 'Now',
      description: 'Module scaffold only (no UI yet).',
      icon: 'i-lucide-check-circle',
      color: 'primary',
    },
    {
      title: 'Next',
      description: 'Launch pages, drop schedules, and basic campaign flow.',
      icon: 'i-lucide-clock-3',
      color: 'warning',
    },
    {
      title: 'Later',
      description: 'Timed releases, inventory hooks, and marketing automations.',
      icon: 'i-lucide-rocket',
      color: 'neutral',
    },
  ],
}

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
      color: 'amber',
      icon: 'i-heroicons-exclamation-triangle',
    })
  } else {
    console.warn(`${title}: ${description}`)
  }
}

function resolveCheckoutPriceId(product?: Partial<FirebaseProduct>): string {
  const stripe = (product?.metadata as any)?.stripe || {}
  const ids = Array.isArray(stripe?.price_ids)
    ? stripe.price_ids.map((id: unknown) => String(id || '').trim()).filter(Boolean)
    : []
  if (ids.length) return ids[0]

  const fallback = String(product?.default_price?.id || '').trim()
  if (!fallback || fallback.startsWith('local_')) return ''
  return fallback
}

async function startCheckout() {
  const product = moduleProduct.value
  const appId = String(
    product?.source_app_id ||
      product?.created?.app_id ||
      product?.metadata?.app_id ||
      ''
  ).trim()
  const productId = String(product?.id || '').trim()
  const productSlug = String(product?.slug || '').trim()
  const priceId = resolveCheckoutPriceId(product ?? undefined)

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
