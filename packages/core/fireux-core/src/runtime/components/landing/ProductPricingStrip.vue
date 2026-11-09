<template>
  <CoreLandingPricingStrip
    :ariaLabel="`${props.appName} plans`"
    :plans="props.plans"
  />
</template>

<script setup lang="ts">
import type { LandingPricingPlan } from '../../models/landing/product'
import CoreLandingPricingStrip from './PricingStrip.vue'

const props = defineProps<{
  appName: string
  plans: readonly LandingPricingPlan[]
}>()
</script>
