<template>
  <div class="grid grid-cols-1 gap-4">
    <UPageCard variant="subtle">
      <h1 class="text-xl font-semibold">{{ ecosystem }} Stuff</h1>
      <p class="text-sm text-dimmed mt-2">No ecosystem dashboard section yet.</p>
    </UPageCard>
  </div>
</template>

<script setup lang="ts">
import { useFireUXConfig } from '../../composables/fireux/app/FireUXConfig'

const { ecosystem } = useFireUXConfig()
</script>
