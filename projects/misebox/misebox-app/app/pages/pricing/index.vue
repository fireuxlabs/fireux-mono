<template>
  <AppPricingCatalogue :tiers="tiers" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
const pricing = useMiseboxPricing()
const config = useFireUXConfig()
const tiers = computed(() =>
  pricing.tiers.value.map((tier) => {
    if (!import.meta.dev) return tier
    const plan = tier.id === 'professional' ? 'premium' : tier.id
    if (plan !== 'free' && plan !== 'premium' && plan !== 'business')
      return tier
    const limit = config.subscriptionCapacity['kitchen.test']?.[plan]
    if (limit === undefined) return tier
    const tests = `${limit === null ? 'Unlimited' : limit} Test records per workspace (development only)`
    return {
      ...tier,
      features: [...tier.features, tests],
      included: [...tier.included, tests],
    }
  })
)

definePageMeta({
  layout: 'landing',
  nav: {
    key: 'pricing',
    label: 'Pricing',
    icon: 'i-lucide-badge-dollar-sign',
    order: 80,
    position: 'bottom',
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: 'Pricing · Misebox',
  description:
    'Misebox pricing for Free, Professional, Business, Managed, and your own branded App.',
})
</script>
