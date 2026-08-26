<template>
  <PublicPricingPage
    :title="`${props.appName} pricing`"
    :description="props.description"
    :plans="plans"
  >
    <template #intro>
      <p class="text-sm leading-6 text-toned">
        {{
          props.intro ||
          'Free is functional. Pro gives the operation more capacity. Managed adds practical help. Your App gives the business its own identity.'
        }}
      </p>
    </template>

    <template #actions>
      <UButton to="/get-started" icon="i-lucide-arrow-right">
        Get started
      </UButton>
    </template>
  </PublicPricingPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PricingTier } from '../../composables/fireux/pricing/usePricing'

const props = defineProps<{
  appName: string
  description: string
  tiers: readonly PricingTier[]
  intro?: string
}>()
const plans = computed(() =>
  props.tiers.map((tier) => ({
    ...tier,
    priceCurrency: 'CHF',
    button: {
      label: `View ${tier.title}`,
      to: tier.to,
      color: tier.id === 'pro' ? ('primary' as const) : ('neutral' as const),
      variant: 'soft' as const,
      trailingIcon: 'i-lucide-arrow-right',
    },
    highlight: tier.id === 'pro',
    scale: tier.id === 'pro',
  }))
)
</script>
