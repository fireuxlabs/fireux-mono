<template>
  <section aria-labelledby="ingredient-tools-title" class="space-y-3">
    <div class="space-y-1">
      <h2
        id="ingredient-tools-title"
        class="text-base font-semibold text-highlighted"
      >
        Tools
      </h2>
      <p class="text-sm text-dimmed">
        Kitchen actions that work with this Ingredient collection.
      </p>
    </div>

    <div class="flex flex-wrap gap-3">
      <MoleculesActionSurface
        :to="canWrite ? '/console/kitchen/ingredients/add' : undefined"
        :disabled="!canWrite"
        class="ingredient-tool-card group flex flex-col overflow-hidden rounded-xl border border-primary/20 bg-primary/5 shadow-sm transition"
        :class="
          canWrite
            ? 'hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/10 hover:shadow-md'
            : ''
        "
      >
        <div class="flex min-h-0 flex-1 items-center justify-center">
          <span
            class="flex size-11 items-center justify-center rounded-full bg-primary text-inverted shadow-sm transition-transform group-hover:scale-105"
          >
            <UIcon name="i-lucide-plus" class="size-5" />
          </span>
        </div>

        <div
          class="flex min-w-0 items-center gap-2 border-t border-primary/15 bg-default/70 px-3 py-2.5"
        >
          <div class="min-w-0 flex-1">
            <h3 class="truncate text-sm font-semibold text-highlighted">
              Add ingredient
            </h3>
            <p class="truncate text-xs text-dimmed">
              Select from the shared library
            </p>
          </div>
          <UBadge v-if="!canWrite" color="neutral" variant="soft" size="xs">
            {{ readOnly ? 'Live only' : 'No access' }}
          </UBadge>
          <UIcon
            v-else
            name="i-lucide-arrow-right"
            class="size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5"
          />
        </div>
      </MoleculesActionSurface>

      <MoleculesActionSurface
        disabled
        class="ingredient-tool-card flex flex-col overflow-hidden rounded-xl border border-default bg-elevated/40 shadow-sm"
      >
        <div class="flex min-h-0 flex-1 items-center justify-center">
          <span
            class="flex size-11 items-center justify-center rounded-full bg-elevated text-muted"
          >
            <UIcon name="i-lucide-clipboard-check" class="size-5" />
          </span>
        </div>

        <div
          class="flex min-w-0 items-center gap-2 border-t border-default bg-default/70 px-3 py-2.5"
        >
          <div class="min-w-0 flex-1">
            <h3 class="truncate text-sm font-semibold text-highlighted">
              Stock take
            </h3>
            <p class="truncate text-xs text-dimmed">
              Count stock and record variances
            </p>
          </div>
          <UBadge color="neutral" variant="soft" size="xs">
            Coming soon
          </UBadge>
        </div>
      </MoleculesActionSurface>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useKitchenIngredientsWorkspace } from '../../../../../composables/fireux/console/kitchen/operations/Ingredients/useKitchenIngredientsWorkspace'

const { canWrite, readOnly } = useKitchenIngredientsWorkspace()
</script>

<style scoped>
.ingredient-tool-card {
  aspect-ratio: 1;
  width: calc(var(--spacing) * 38);
}
</style>
