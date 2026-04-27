<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Pricing plans
        </p>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          Demo plans rendered from `demo/product.demo.ts` using Nuxt UI PricingPlan(s).
        </p>
      </div>
    </template>

    <UPricingPlans :plans="plans" />
  </UCard>
</template>

<script setup lang="ts">
defineOptions({ name: 'DevProductPricingPlans' })

import { computed } from 'vue'
import { demoProductList } from '../../../../../../../../demo/product.demo'
import type { FirebaseProduct, Price } from '../../../models/product.model'

const props = defineProps<{
  selectedId?: string
}>()

const formatMoney = (unitAmount: number, currency?: string) => {
  const amount = Number(unitAmount ?? 0)
  const iso = (currency || 'USD').toUpperCase()
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: iso,
  }).format(amount / 100)
}

const findMonthlyPrice = (prices: Price[]) =>
  prices.find(
    (price) =>
      price?.metadata?.kind === 'subscription' ||
      (price?.type === 'recurring' && price?.interval === 'month')
  )

const selectedProducts = computed(() => {
  if (!props.selectedId) return demoProductList
  const match = demoProductList.filter((product) => product.id === props.selectedId)
  return match.length ? match : demoProductList
})

const plans = computed(() =>
  selectedProducts.value.map((product: FirebaseProduct, index: number) => {
    const prices = Array.isArray(product.prices) ? product.prices : []
    const monthly = findMonthlyPrice(prices)

    const monthlyLabel = monthly
      ? formatMoney(monthly.unit_amount, monthly.currency)
      : product.default_price?.unit_amount
        ? formatMoney(product.default_price.unit_amount, prices[0]?.currency)
        : 'Contact us'

    const features = (product.features ?? [])
      .filter((feature) => feature.available)
      .map((feature) => feature.title)
      .filter(Boolean)

    const ctaLabel =
      (product as any)?.metadata?.cta?.label || 'Get started'

    const highlight = index === 0

    return {
      title: product.name,
      description: product.description,
      badge: (product as any)?.metadata?.category || undefined,
      price: monthlyLabel,
      billingCycle: monthly ? '/mo' : undefined,
      billingPeriod: undefined,
      features,
      highlight,
      scale: highlight,
      tagline: product.tagline,
      terms: (product as any)?.metadata?.delivery?.estimated_time
        ? `Delivery: ${(product as any).metadata.delivery.estimated_time}`
        : undefined,
      button: {
        label: ctaLabel,
        to: product.id ? `/products/${product.id}` : undefined,
        color: highlight ? 'primary' : 'neutral',
        variant: highlight ? 'solid' : 'outline',
      },
    }
  })
)
</script>
