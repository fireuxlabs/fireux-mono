<template>
  <PublicPricingPage
    :title="`${appName} pricing`"
    :description="description"
    :plans="plans"
  >
    <template #intro>
      <p class="text-sm leading-6 text-toned">
        Free is functional. Pro gives the operation more capacity. Managed adds
        practical help from FireUX. Your App gives the business its own identity.
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
import { useProductPricingLiterature } from '../../composables/fireux/pricing/useProductPricingLiterature'

const { appName, description, tiers } = useProductPricingLiterature()
const plans = computed(() =>
  tiers.value.map((tier) => ({
    ...tier,
    priceCurrency: 'CHF',
    button: {
      label: `View ${tier.title}`,
      to: tier.to,
      color: tier.id === 'pro' ? 'primary' as const : 'neutral' as const,
      variant: 'soft' as const,
      trailingIcon: 'i-lucide-arrow-right',
    },
    highlight: tier.id === 'pro',
    scale: tier.id === 'pro',
  }))
)
</script>
