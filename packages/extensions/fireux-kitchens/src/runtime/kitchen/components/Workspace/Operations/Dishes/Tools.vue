<template>
  <UCard
    v-if="canWrite"
    :aria-labelledby="`create-${catalogue.singular}-title`"
  >
    <template #header>
      <div>
        <h2
          :id="`create-${catalogue.singular}-title`"
          class="text-sm font-semibold text-highlighted"
        >
          Tools
        </h2>
        <p class="mt-1 text-sm text-muted">
          Add a {{ catalogue.singular }} to this Kitchen collection.
        </p>
      </div>
    </template>

    <UButton :to="catalogue.createPath" icon="i-lucide-plus">
      Create {{ catalogue.singular }}
    </UButton>
  </UCard>
</template>

<script setup lang="ts">
import { useKitchenDishesWorkspace } from '../../../../composables/workspace/operations/Dishes/useKitchenDishesWorkspace'

const { canWrite, catalogue } = useKitchenDishesWorkspace()
</script>
