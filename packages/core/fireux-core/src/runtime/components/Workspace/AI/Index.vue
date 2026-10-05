<template>
  <section v-if="compact" :aria-label="ariaLabel" class="py-4 sm:py-6">
    <div class="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 sm:px-6">
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
