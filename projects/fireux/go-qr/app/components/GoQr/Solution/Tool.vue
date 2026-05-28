<template>
  <section class="space-y-4">
    <UBadge
      v-if="solution.badge"
      :label="solution.badge"
      color="primary"
      variant="soft"
    />
    <ClientOnly>
      <div class="flex justify-center">
        <slot />
      </div>
    </ClientOnly>
  </section>
</template>

<script setup lang="ts">
import type { GoQrSolution } from '../../../utils/goQrSolutions'

defineProps<{
  solution: GoQrSolution
}>()
</script>
