<template>
  <div>
    <div v-if="variant === 'cell'" class="product-cell">
      <div v-if="product?.main_image" class="cell-thumb">
        <img :src="product.main_image" alt="Product image" />
      </div>
      <div class="cell-text">
        <h3 class="cell-title">
          {{ display(product?.name) || 'Unnamed Product' }}
        </h3>
        <p class="cell-description">{{ display(product?.description) }}</p>
        <p v-if="product?.default_price" class="cell-price">
          {{ formatDefaultPrice(product) }}
        </p>
        <div class="purchace-buttons">
          <UButton
            :disabled="props.mode === 'preview' || isBuying"
            color="primary"
            @click="startCheckout"
          >
            {{ isBuying ? 'Starting checkout...' : 'Buy Now' }}
          </UButton>
          <UButton :disabled="props.mode === 'preview'" variant="outline">Add to Basket</UButton>
        </div>
      </div>
    </div>

    <div v-else-if="variant === 'customer'">
      <p>
        <strong>{{ display(product?.name) }}</strong>
      </p>
      <p>{{ display(product?.description) }}</p>
      <p v-if="product?.default_price">{{ formatDefaultPrice(product) }}</p>
      <div class="purchace-buttons">
        <UButton
          :disabled="props.mode === 'preview' || isBuying"
          color="primary"
          @click="startCheckout"
        >
          {{ isBuying ? 'Starting checkout...' : 'Buy Now' }}
        </UButton>
        <UButton :disabled="props.mode === 'preview'" variant="outline">Add to Basket</UButton>
      </div>
    </div>

    <div v-else-if="variant === 'info'">
      <ul>
        <li v-if="product?.id"><strong>ID:</strong> {{ product.id }}</li>
        <li><strong>Name:</strong> {{ display(product?.name) }}</li>
        <li><strong>Slug:</strong> {{ display(product?.slug) }}</li>
        <li><strong>Created:</strong> {{ display(product?.created_at) }}</li>
        <li><strong>Updated:</strong> {{ display(product?.updated_at) }}</li>
        <li><strong>Tenant:</strong> {{ display(product?.appId) }}</li>
        <li><strong>Creator:</strong> {{ display(product?.creator_id) }}</li>
        <li>
          <strong>Image Supplied:</strong>
          {{ product?.main_image ? 'Yes' : 'No' }}
        </li>
        <li><strong>Type:</strong> {{ display(product?.product_type) }}</li>
        <li>
          <strong>Stock:</strong>
          <span :style="{ color: product?.stock == null ? 'red' : 'inherit' }">{{
            product?.stock ?? '!'
          }}</span>
        </li>
        <li>
          <strong>Track Stock:</strong>
          {{ display(product?.track_stock ? 'Yes' : 'No') }}
        </li>
        <li><strong>Content:</strong> {{ display(product?.content) }}</li>
        <li>
          <strong>Default Price:</strong>
          <span
            :style="{
              color:
                product?.default_price?.unit_amount == null ? 'red' : 'inherit',
            }"
            >{{ product?.default_price?.unit_amount ?? '!' }}</span
          >
        </li>
      </ul>
    </div>

    <div v-else-if="variant === 'page'">
        <div class="product-page">
          <header class="product-hero">
            <div>
              <p class="product-kicker">{{ display(product?.tagline) }}</p>
              <h1 class="product-title">{{ display(product?.name) }}</h1>
              <p class="product-summary">{{ display(product?.description) }}</p>
            </div>
            <div class="product-price">
              <span class="price-label">From</span>
              <span class="price-value">{{ formatDefaultPrice(product) || 'Custom' }}</span>
              <span class="price-note">Hosted and maintained</span>
            </div>
          </header>

          <section class="product-section">
            <h2>Overview</h2>
            <div v-html="product?.content" v-if="product?.content" />
            <p v-else class="missing">!</p>
          </section>

          <section class="product-section">
            <h2>Questions</h2>
            <div class="qa">
              <p class="qa-q">{{ display(product?.Q) }}</p>
              <p class="qa-a">{{ display(product?.A) }}</p>
            </div>
          </section>

          <div class="purchace-buttons">
            <UButton
              :disabled="props.mode === 'preview' || isBuying"
              color="primary"
              @click="startCheckout"
            >
              {{ isBuying ? 'Starting checkout...' : 'Buy now' }}
            </UButton>
            <UButton :disabled="props.mode === 'preview'" variant="outline">Book a call</UButton>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { FirebaseProduct } from '../../../../models/product.model';

const useToastFn = (globalThis as any).useToast as undefined | (() => any)
const toast = useToastFn ? useToastFn() : undefined

const props = defineProps<{
  product?: Partial<FirebaseProduct>
  variant?: 'customer' | 'info' | 'cell' | 'page'
  mode?: 'preview' | 'fetch'
}>()
const isBuying = ref(false)

function display(value: unknown): string {
  return typeof value === 'string' && value.trim() !== '' ? value : '!'
}

function formatMoney(unitAmount: number, currency?: string): string {
  const iso = (currency || 'EUR').toUpperCase()
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: iso,
  }).format(Number(unitAmount ?? 0) / 100)
}

function formatDefaultPrice(product?: Partial<FirebaseProduct>): string {
  if (!product?.default_price) return ''
  const currency = product.prices?.[0]?.currency
  const base = formatMoney(product.default_price.unit_amount, currency)
  return product.default_price.interval
    ? `${base}/${product.default_price.interval}`
    : base
}

const notify = (
  title: string,
  description: string,
  color: 'green' | 'amber' | 'red' = 'amber'
) => {
  if (toast) {
    toast.add({
      title,
      description,
      color,
      icon:
        color === 'green'
          ? 'i-heroicons-check-circle'
          : color === 'red'
            ? 'i-heroicons-x-circle'
            : 'i-heroicons-exclamation-triangle',
    })
    return
  }
  console.warn(`${title}: ${description}`)
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

function resolveCheckoutMode(product?: Partial<FirebaseProduct>) {
  const firstType = String(product?.prices?.[0]?.type || '').trim()
  return firstType === 'recurring' ? 'subscription' : 'payment'
}

async function startCheckout() {
  if (props.mode === 'preview') return

  const product = props.product
  const appId = String(product?.appId || '').trim()
  const productId = String(product?.id || '').trim()
  const slug = String(product?.slug || '').trim()
  const priceId = resolveCheckoutPriceId(product)

  if (!appId || !productId || !slug) {
    notify('Checkout unavailable', 'Product data is incomplete for checkout.', 'red')
    return
  }

  if (!priceId) {
    notify(
      'Checkout unavailable',
      'No live Stripe price found for this product yet.',
      'amber'
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
          slug,
          priceId,
          mode: resolveCheckoutMode(product),
        },
      }
    )

    const checkoutUrl = String(response?.url || '').trim()
    if (!checkoutUrl) {
      throw new Error('Checkout session URL missing')
    }

    window.location.href = checkoutUrl
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to start checkout'
    notify('Checkout failed', message, 'red')
  } finally {
    isBuying.value = false
  }
}
</script>

<style scoped>
.missing {
  color: red;
  font-weight: bold;
}

.product-cell {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  text-align: left;
}

.cell-thumb {
  width: 7rem;
  aspect-ratio: 4 / 3;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: var(--radius-sm);
  background: transparent;
}

.cell-thumb img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
}

.cell-text {
  flex: 1;
}

.cell-title {
  margin: 0;
  font-weight: 600;
  text-align: left;
}

.cell-description {
  color: #6b7280;
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.cell-price {
  margin-top: 0.5rem;
  font-weight: bold;
}

.purchace-buttons {
  margin-top: 1rem;
  display: flex;
  gap: 0.75rem;
}

.product-page {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.product-hero {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--ui-border);
}

.product-kicker {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.75rem;
  color: #6b7280;
}

.product-title {
  font-size: 2rem;
  margin: 0.25rem 0 0.5rem;
}

.product-summary {
  max-width: 36rem;
  color: #4b5563;
}

.product-price {
  min-width: 14rem;
  padding: 1rem;
  border: 1px solid var(--ui-border);
  border-radius: var(--radius-md);
  background: var(--ui-bg-elevated);
  text-align: left;
}

.price-label {
  display: block;
  font-size: 0.8rem;
  color: #6b7280;
}

.price-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0.25rem 0;
}

.price-note {
  display: block;
  font-size: 0.8rem;
  color: #6b7280;
}

.product-section h2 {
  margin: 0 0 0.75rem;
  font-size: 1.1rem;
}

.qa {
  padding: 1rem;
  border: 1px solid var(--ui-border);
  border-radius: var(--radius-md);
  background: var(--ui-bg);
}

.qa-q {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.qa-a {
  color: #4b5563;
}

</style>
