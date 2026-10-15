<template>
  <UButton
    :disabled="preview || isBuying"
    color="primary"
    @click="startCheckout"
  >
    {{ isBuying ? 'Starting checkout...' : 'Buy now' }}
  </UButton>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import type { Product, ProductPrice } from '../../utils/product'
const props = defineProps<{
  product?: Partial<Product>
  defaultPrice?: Partial<ProductPrice> | null
  preview?: boolean
}>()
const useToastFn = (globalThis as any).useToast as undefined | (() => any)
const toast = useToastFn ? useToastFn() : undefined
const isBuying = ref(false)
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
  const fallback = String(
    props.defaultPrice?.provider_price_id || props.defaultPrice?.id || ''
  ).trim()
  if (!fallback || fallback.startsWith('local_')) return ''
  return fallback
}

function resolveCheckoutMode() {
  const firstType = String(props.defaultPrice?.type || '').trim()
  return firstType === 'recurring' ? 'subscription' : 'payment'
}

async function startCheckout() {
  if (props.preview) return

  const product = props.product
  const appId = String(product?.source_app_id || '').trim()
  const productId = String(product?.id || '').trim()
  const slug = productId
  const priceId = resolveCheckoutPriceId()

  if (!appId || !productId || !slug) {
    notify(
      'Checkout unavailable',
      'Product data is incomplete for checkout.',
      'error'
    )
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
    const message =
      error instanceof Error ? error.message : 'Failed to start checkout'
    notify('Checkout failed', message, 'error')
  } finally {
    isBuying.value = false
  }
}
</script>
