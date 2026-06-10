<template>
  <PortfolioCollectionManager
    :collection="collection"
    :console-ids="consoleIds"
    v-model:filter-mode="liveMode"
    :filter-options="liveModeOptions"
    :show-filter-toggle="true"
    title="Choose Portfolio"
    description="Select the portfolio you want to work on."
    :link="false"
    :action="true"
    :show-badges="false"
    @select="emit('select', $event)"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Portfolio } from '../../../../models/portfolio.model'

type LiveMode = 'console' | 'mine'

const props = withDefaults(
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

const liveMode = ref<LiveMode>('console')
const liveModeOptions = [
  { value: 'console' as const, label: 'Portfolio consoles' },
  { value: 'mine' as const, label: 'My portfolios' },
]
const consoleIds = computed(() =>
  props.collection
    .map((portfolio) => String(portfolio.id ?? '').trim())
    .filter(Boolean)
)
</script>
