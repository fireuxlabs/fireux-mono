<template>
  <section class="space-y-2">
    <pre>ConsolePortfolioIndexTargets</pre>

    <PortfolioCollectionManager
      :collection="collection"
      :console-ids="consoleIds"
      :action-ids="consoleIds"
      v-model:filter-mode="targetMode"
      :filter-options="targetModeOptions"
      :show-filter-toggle="true"
      title="Choose Portfolio"
      description="Select the Portfolio console target you want to work on."
      :link="false"
      :action="true"
      :show-badges="false"
      @select="selectPortfolio"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Portfolio } from '../../../../models/portfolio.model'

type TargetMode = 'console' | 'mine'

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

const targetMode = ref<TargetMode>('console')
const targetModeOptions = [
  { value: 'console' as const, label: 'Portfolio consoles' },
  { value: 'mine' as const, label: 'My portfolios' },
]
const consoleIds = computed(() =>
  props.collection
    .map((portfolio) => String(portfolio.id ?? '').trim())
    .filter(Boolean)
)
const consoleIdSet = computed(() => new Set(consoleIds.value))
function selectPortfolio(id: string) {
  const portfolioId = String(id ?? '').trim()
  if (!consoleIdSet.value.has(portfolioId)) return
  emit('select', portfolioId)
}
</script>
