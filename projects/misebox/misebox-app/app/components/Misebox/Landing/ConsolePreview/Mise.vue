<template>
  <div class="mt-5" aria-label="Mise en place preview">
    <div v-if="requirements.length" class="grid max-h-[24rem] gap-2 overflow-y-auto">
      <article
        v-for="requirement in requirements"
        :key="requirement.id"
        class="flex items-start gap-3 rounded-xl border border-default bg-default p-3 shadow-sm"
      >
        <span class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <UIcon name="i-lucide-list-checks" class="size-4" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-semibold text-highlighted">{{ requirement.title }}</p>
          <p class="mt-1 text-xs text-muted">
            {{ requirement.station }} · {{ requirement.quantity }}
          </p>
        </div>
        <UBadge v-if="requirement.recipeId" color="neutral" variant="soft" size="sm">
          Recipe
        </UBadge>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MiseboxProductDemo } from '~/composables/product-demo/useMiseboxProductDemo'

type ProductDemoMise = MiseboxProductDemo['console']['mise'][number]

defineProps<{
  requirements: ProductDemoMise[]
}>()
</script>
