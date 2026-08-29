<template>
  <AppPricingPage
    title="Choose your plan"
    :plan-groups="planGroups"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AppPricingTier } from '../../composables/pricing/usePricing'
import type { PricingPlanGroup } from '../../utils/pricing/page'

const props = defineProps<{
  tiers: readonly AppPricingTier[]
}>()
function plan(tier: AppPricingTier) {
  return {
    ...tier,
    priceCurrency: 'CHF',
    button: {
      label: `View ${tier.title}`,
      to: tier.to,
      color:
        tier.id === 'professional'
          ? ('primary' as const)
          : ('neutral' as const),
      variant: 'soft' as const,
      trailingIcon: 'i-lucide-arrow-right',
    },
    highlight: tier.id === 'professional',
  }
}

const planGroups = computed<PricingPlanGroup[]>(() => {
  const subscriptions = props.tiers.filter((tier) =>
    ['free', 'professional', 'business'].includes(tier.id)
  )
  const offers = props.tiers.filter(
    (tier) => !['free', 'professional', 'business'].includes(tier.id)
  )

  return [
    {
      id: 'subscriptions',
      plans: subscriptions.map(plan),
    },
    ...offers.map((offer) => ({
      id: offer.id,
      plans: [plan(offer)],
    })),
  ]
})
</script>
