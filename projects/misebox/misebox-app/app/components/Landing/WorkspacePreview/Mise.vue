<template>
  <div class="mt-5" aria-label="Mise en place preview">
    <div class="max-h-[24rem] overflow-y-auto pr-1">
      <KitchenMiseTaskCollection
        :tasks="tasks"
        :kitchen-name="kitchenName"
        heading-id="landing-workspace-mise-status"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MiseboxProductDemo } from '~/composables/product-demo/useMiseboxProductDemo'

type ProductDemoMiseTask =
  MiseboxProductDemo['workspace']['miseTasks'][number]

defineProps<{
  kitchenName: string
  tasks: ProductDemoMiseTask[]
}>()
</script>
