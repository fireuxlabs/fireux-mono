<template>
  <FireLandingPricingStrip
    :ariaLabel="`${props.appName} plans`"
    :plans="props.plans"
  />
</template>

<script setup lang="ts">
import type { LandingPricingPlan } from '../../models/landing/product'

const props = defineProps<{
  appName: string
  plans: readonly LandingPricingPlan[]
}>()
</script>
