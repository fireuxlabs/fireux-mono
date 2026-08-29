<template>
  <UPageSection :aria-label="ariaLabel">
    <slot />
  </UPageSection>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ ariaLabel?: string }>(), {
  ariaLabel: 'Workspace AI',
})
</script>
