<template>
  <LandingPricingStrip
    :ariaLabel="`${appName} plans`"
    :plans="landingTiers"
  />
</template>

<script setup lang="ts">
import type { ProductPricingProfile } from '../../composables/fireux/pricing/useProductPricingLiterature'
import { useProductPricingLiterature } from '../../composables/fireux/pricing/useProductPricingLiterature'

const props = defineProps<{ profile?: ProductPricingProfile }>()
const { appName, landingTiers } = useProductPricingLiterature(props.profile)
</script>
