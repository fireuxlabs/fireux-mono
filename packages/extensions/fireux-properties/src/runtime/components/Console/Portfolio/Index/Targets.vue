<template>
  <section class="space-y-2">
    <pre>ConsolePortfolioIndexTargets</pre>

    <PortfolioCollectionManager
      :collection="collection"
      :pending="pending"
      :console-ids="consoleIds"
      :action-ids="consoleIds"
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
import { computed } from 'vue'
import type { Portfolio } from '../../../../models/portfolio.model'

const props = withDefaults(
  defineProps<{
    collection?: Portfolio[]
    pending?: boolean
  }>(),
  {
    collection: () => [],
    pending: false,
  }
)

const emit = defineEmits<{
  (event: 'select', id: string): void
}>()

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
