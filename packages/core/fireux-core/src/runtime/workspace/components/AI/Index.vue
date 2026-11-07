<template>
  <section v-if="compact" :aria-label="ariaLabel">
    <div>
      <slot />
    </div>
  </section>
  <UPageSection v-else :aria-label="ariaLabel">
    <slot />
  </UPageSection>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    ariaLabel?: string
    compact?: boolean
  }>(),
  {
    ariaLabel: 'Workspace AI',
    compact: false,
  }
)
</script>
