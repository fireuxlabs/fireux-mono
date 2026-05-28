<template>
  <section>
    <ClientOnly>
      <div class="flex justify-center">
        <slot />
      </div>

      <template #fallback>
        <UCard
          class="w-full max-w-xl"
          variant="subtle"
        >
          <div class="space-y-3">
            <USkeleton class="h-5 w-2/3" />
            <USkeleton class="h-32 w-full" />
            <USkeleton class="h-10 w-full" />
          </div>
        </UCard>
      </template>
    </ClientOnly>
  </section>
</template>

<script setup lang="ts">
import type { MiseboxSolution } from '../../../utils/miseboxSolutions'

defineProps<{
  solution: MiseboxSolution
}>()
</script>
