<template>
  <section class="space-y-2">
    <pre>ConsolePortfolioIndexDemo</pre>

    <PortfolioCollectionManager
      :collection="collection"
      title="Demo Portfolios"
      description="Select a read-only Portfolio demo target to inspect the console shape."
      :link="false"
      :action="true"
      :show-badges="true"
      @select="emit('select', $event)"
    />
  </section>
</template>

<script setup lang="ts">
import type { PortfolioConsoleEntity } from '../../../../composables/fireux/console/portfolio/usePortfolioConsole'

withDefaults(
  defineProps<{
    collection?: PortfolioConsoleEntity[]
  }>(),
  {
    collection: () => [],
  }
)

const emit = defineEmits<{
  (event: 'select', id: string): void
}>()
</script>
