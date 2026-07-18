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
        <div class="purchase-buttons">
          <UButton
            :disabled="props.mode === 'preview' || isBuying"
            color="primary"
            @click="startCheckout"
          >
            {{ isBuying ? 'Starting checkout...' : 'Buy Now' }}
          </UButton>
        </div>
      </div>
    </div>

    <div v-else-if="variant === 'customer'">
      <p>
        <strong>{{ display(product?.name) }}</strong>
      </p>
      <p>{{ display(product?.description) }}</p>
      <p v-if="product?.default_price">{{ formatDefaultPrice(product) }}</p>
      <div class="purchase-buttons">
        <UButton
          :disabled="props.mode === 'preview' || isBuying"
          color="primary"
          @click="startCheckout"
        >
          {{ isBuying ? 'Starting checkout...' : 'Buy Now' }}
        </UButton>
      </div>
    </div>

    <div v-else-if="variant === 'info'">
      <ul>
        <li v-if="product?.id"><strong>ID:</strong> {{ product.id }}</li>
        <li><strong>Name:</strong> {{ display(product?.name) }}</li>
        <li><strong>Slug:</strong> {{ display(product?.slug) }}</li>
        <li><strong>Created:</strong> {{ displayTimestamp(product?.created?.at) }}</li>
        <li><strong>Updated:</strong> {{ displayTimestamp(product?.updated?.at) }}</li>
        <li><strong>Source App:</strong> {{ display(product?.source_app_id) }}</li>
        <li><strong>Owner:</strong> {{ display(product?.owner_id) }}</li>
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
              <span class="price-label">{{ priceLabel(product) }}</span>
              <span class="price-value">{{ formatDefaultPrice(product) || 'Custom' }}</span>
            </div>
          </header>

          <section v-if="product?.content" class="product-section">
            <h2>Overview</h2>
            <div v-html="product.content" />
          </section>

          <div class="purchase-buttons">
            <UButton
              :disabled="props.mode === 'preview' || isBuying"
              color="primary"
              @click="startCheckout"
            >
              {{ isBuying ? 'Starting checkout...' : 'Buy now' }}
            </UButton>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { FirebaseProduct } from '../../../models/product.model';

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

function displayTimestamp(value: unknown): string {
  if (!value) return '!'
  if (typeof value === 'string') return display(value)
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'object' && value !== null) {
    const seconds = Number((value as { seconds?: unknown }).seconds ?? 0)
    const nanoseconds = Number((value as { nanoseconds?: unknown }).nanoseconds ?? 0)
    if (seconds > 0) {
      return new Date(seconds * 1000 + Math.floor(nanoseconds / 1_000_000)).toISOString()
    }
  }
  return '!'
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

function priceLabel(product?: Partial<FirebaseProduct>): string {
  return product?.default_price?.interval ? 'From' : 'Price'
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
  const appId = String(product?.source_app_id || '').trim()
  const productId = String(product?.id || '').trim()
  const slug = productId
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
  gap: calc(var(--spacing) * 4);
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
  border-radius: var(--ui-radius);
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
  margin-top: var(--spacing);
}

.cell-price {
  margin-top: calc(var(--spacing) * 2);
  font-weight: bold;
}

.purchase-buttons {
  margin-top: calc(var(--spacing) * 4);
  display: flex;
  gap: calc(var(--spacing) * 3);
}

.product-page {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 8);
}

.product-hero {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 8);
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: calc(var(--spacing) * 4);
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
  margin: var(--spacing) 0 calc(var(--spacing) * 2);
}

.product-summary {
  max-width: 36rem;
  color: #4b5563;
}

.product-price {
  min-width: 14rem;
  padding: calc(var(--spacing) * 4);
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 1.5);
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
  margin: var(--spacing) 0;
}

.product-section h2 {
  margin: 0 0 calc(var(--spacing) * 3);
  font-size: 1.1rem;
}

</style>
