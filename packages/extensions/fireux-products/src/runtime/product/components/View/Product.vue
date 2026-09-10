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
        <p v-if="defaultPrice" class="cell-price">
          {{ formatDefaultPrice(defaultPrice) }}
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
      <p v-if="defaultPrice">{{ formatDefaultPrice(defaultPrice) }}</p>
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
        <li><strong>Visibility:</strong> {{ display(product?.visibility) }}</li>
        <li>
          <strong>Image Supplied:</strong>
          {{ product?.main_image ? 'Yes' : 'No' }}
        </li>
        <li><strong>Type:</strong> {{ display(product?.product_type) }}</li>
        <li><strong>Content:</strong> {{ display(product?.content) }}</li>
        <li>
          <strong>Default Price:</strong>
          <span
            :class="{
              'text-error': defaultPrice?.unit_amount == null,
            }"
            >{{ defaultPrice?.unit_amount ?? '!' }}</span
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
              <span class="price-label">{{ priceLabel(defaultPrice) }}</span>
              <span class="price-value">{{ formatDefaultPrice(defaultPrice) || 'Custom' }}</span>
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
import type { Product, ProductPrice } from '../../utils/product.ts';

const useToastFn = (globalThis as any).useToast as undefined | (() => any)
const toast = useToastFn ? useToastFn() : undefined

const props = defineProps<{
  product?: Partial<Product>
  prices?: Partial<ProductPrice>[]
  defaultPrice?: Partial<ProductPrice> | null
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

function formatDefaultPrice(price?: Partial<ProductPrice> | null): string {
  if (!price) return ''
  const base = formatMoney(Number(price.unit_amount || 0), price.currency)
  return price.interval
    ? `${base}/${price.interval}`
    : base
}

function priceLabel(price?: Partial<ProductPrice> | null): string {
  return price?.interval ? 'From' : 'Price'
}

const notify = (
  title: string,
  description: string,
  color: 'success' | 'warning' | 'error' = 'warning'
) => {
  if (toast) {
    toast.add({
      title,
      description,
      color,
      icon:
        color === 'success'
          ? 'i-heroicons-check-circle'
          : color === 'error'
            ? 'i-heroicons-x-circle'
            : 'i-heroicons-exclamation-triangle',
    })
    return
  }
  console.warn(`${title}: ${description}`)
}

function resolveCheckoutPriceId(): string {
  const fallback = String(props.defaultPrice?.provider_price_id || props.defaultPrice?.id || '').trim()
  if (!fallback || fallback.startsWith('local_')) return ''
  return fallback
}

function resolveCheckoutMode() {
  const firstType = String(props.defaultPrice?.type || '').trim()
  return firstType === 'recurring' ? 'subscription' : 'payment'
}

async function startCheckout() {
  if (props.mode === 'preview') return

  const product = props.product
  const appId = String(product?.source_app_id || '').trim()
  const productId = String(product?.id || '').trim()
  const slug = productId
  const priceId = resolveCheckoutPriceId()

  if (!appId || !productId || !slug) {
    notify('Checkout unavailable', 'Product data is incomplete for checkout.', 'error')
    return
  }

  if (!priceId) {
    notify(
      'Checkout unavailable',
      'No live Stripe price found for this product yet.',
      'warning'
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
          mode: resolveCheckoutMode(),
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
    notify('Checkout failed', message, 'error')
  } finally {
    isBuying.value = false
  }
}
</script>

<style scoped>
.missing {
  color: var(--ui-error);
  font-weight: var(--font-weight-bold);
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
  font-weight: var(--font-weight-semibold);
  text-align: left;
}

.cell-description {
  color: var(--ui-text-muted);
  font-size: var(--text-sm);
  margin-top: var(--spacing);
}

.cell-price {
  margin-top: calc(var(--spacing) * 2);
  font-weight: var(--font-weight-bold);
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
  letter-spacing: var(--tracking-widest);
  font-size: var(--text-xs);
  color: var(--ui-text-muted);
}

.product-title {
  font-size: var(--text-3xl);
  margin: var(--spacing) 0 calc(var(--spacing) * 2);
}

.product-summary {
  max-width: 36rem;
  color: var(--ui-text-toned);
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
  font-size: var(--text-xs);
  color: var(--ui-text-muted);
}

.price-value {
  display: block;
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  margin: var(--spacing) 0;
}

.product-section h2 {
  margin: 0 0 calc(var(--spacing) * 3);
  font-size: var(--text-lg);
}

</style>
