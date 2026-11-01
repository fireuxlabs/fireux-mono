<template>
  <UPageSection
    :as="{ title: primary ? 'h1' : 'h2' }"
    headline="Kitchen Workspace"
    title="Run your Kitchen. Your way."
    description="Start free. Choose the plan that fits your operation."
  >
    <UPricingPlans>
      <UPricingPlan
        class="misebox-plan"
        v-for="tier in tiers"
        :key="tier.id"
        :title="tier.title"
        :description="tier.description"
        :price="tier.price"
        :billing-cycle="tier.billingCycle"
        :features="tier.included.slice(0, 4)"
        :terms="tier.priceNote"
        :highlight="tier.id === 'professional'"
        :badge="tier.id === 'professional' ? 'One Kitchen' : undefined"
        :button="{
          label: tier.id === 'free' ? 'Explore Free' : `Explore ${tier.title}`,
          to: tier.to,
          trailingIcon: 'i-lucide-arrow-right',
          variant: tier.id === 'professional' ? 'solid' : 'outline',
        }"
      />
    </UPricingPlans>
  </UPageSection>
</template>
<script setup lang="ts">
import type { AppPricingTier } from 'fireux-core/runtime/app/composables/pricing/usePricing'
defineProps<{ tiers: readonly AppPricingTier[]; primary?: boolean }>()
</script>

<style scoped>
.misebox-plan :deep(li span) {
  white-space: normal;
  overflow: visible;
}
</style>
