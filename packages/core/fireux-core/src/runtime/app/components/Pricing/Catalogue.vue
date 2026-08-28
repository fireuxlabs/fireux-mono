<template>
  <AppPricingPage
    :title="`${props.appName} pricing`"
    :description="props.description"
    :plans="plans"
  >
    <template #intro>
      <p class="text-sm leading-6 text-toned">
        {{
          props.intro ||
          'Free starts one workspace. Professional completes it. Business operates several. Managed adds agreed work to selected workspaces. Your App gives the product its own identity.'
        }}
      </p>
    </template>

    <template #actions>
      <UButton to="/get-started" icon="i-lucide-arrow-right">
        Get started
      </UButton>
    </template>
  </AppPricingPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AppPricingTier } from '../../composables/pricing/usePricing'

const props = defineProps<{
  appName: string
  description: string
  tiers: readonly AppPricingTier[]
  intro?: string
}>()
const plans = computed(() =>
  props.tiers.map((tier) => ({
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
    scale: tier.id === 'professional',
  }))
)
</script>
