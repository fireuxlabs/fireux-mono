<template>
  <LandingPricingStrip
    :ariaLabel="`${props.appName} plans`"
    :plans="props.plans"
  />
</template>

<script setup lang="ts">
import type { LandingPricingPlan } from '../../../types/landing-product'

const props = defineProps<{
  appName: string
  plans: readonly LandingPricingPlan[]
}>()
</script>
