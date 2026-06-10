<template>
  <PortfolioCollectionManager
    :collection="collection"
    title="Choose Portfolio"
    description="Select the portfolio you want to work on."
    :link="false"
    :action="true"
    :show-badges="false"
    @select="emit('select', $event)"
  />
</template>

<script setup lang="ts">
import type { Portfolio } from '../../../../models/portfolio.model'

withDefaults(
  defineProps<{
    collection?: Portfolio[]
  }>(),
  {
    collection: () => [],
  }
)

const emit = defineEmits<{
  (event: 'select', id: string): void
}>()
</script>
