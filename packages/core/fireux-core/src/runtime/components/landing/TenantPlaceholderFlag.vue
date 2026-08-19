<template>
  <UAlert
    v-if="isPlaceholderBranding"
    color="warning"
    variant="soft"
    icon="i-lucide-image-off"
    title="Placeholder branding active"
    description="This tenant is using shared FireUX placeholder branding. Add tenant assets under /public/img/app when the real brand is ready."
    class="mx-auto mb-6 w-full max-w-5xl"
  />
</template>

<script setup lang="ts">
import { useTenantPlaceholderBranding } from '../../app/composables/brand/useTenantPlaceholderBranding'

const { isPlaceholderBranding } = useTenantPlaceholderBranding()
</script>
