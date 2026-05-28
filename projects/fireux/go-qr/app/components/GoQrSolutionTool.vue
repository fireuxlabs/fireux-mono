<template>
  <section class="space-y-4">
    <UBadge
      v-if="solution.badge"
      :label="solution.badge"
      color="primary"
      variant="soft"
    />
    <p class="max-w-xl text-base leading-7 text-muted">
      {{ solution.intro }}
    </p>

    <ClientOnly>
      <slot />
    </ClientOnly>
  </section>
</template>

<script setup lang="ts">
import type { GoQrSolution } from '../utils/goQrSolutions'

defineProps<{
  solution: GoQrSolution
}>()
</script>
