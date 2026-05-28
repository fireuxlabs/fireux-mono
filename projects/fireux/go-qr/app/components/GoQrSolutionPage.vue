<template>
  <PublicSimplePage
    :title="solution.title"
    :description="solution.description"
    back-to="/solutions"
    back-label="Solutions"
  >
    <div class="space-y-8">
      <slot />
    </div>
  </PublicSimplePage>
</template>

<script setup lang="ts">
import type { GoQrSolution } from '../utils/goQrSolutions'

defineProps<{
  solution: GoQrSolution
}>()
</script>
