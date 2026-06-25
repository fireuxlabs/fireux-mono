<template>
  <section class="space-y-2">
    <pre>ConsolePortfolioIndexTargets</pre>

    <UCard>
      <template #header>
        <div class="collection-manager__header">
          <div class="collection-manager__title">
            <h2>Choose Portfolio</h2>
            <p>Select the Portfolio console target you want to work on.</p>
          </div>

          <UBadge variant="soft">{{ cards.length }}</UBadge>
        </div>
      </template>

      <p v-if="pending" class="text-sm text-dimmed">Loading portfolios...</p>

      <div v-else-if="cards.length" class="space-y-3">
        <PortfolioCardsCell
          v-for="card in cards"
          :key="card.id"
          v-bind="card"
          :link="false"
          action
          :show-badges="false"
          @action="selectPortfolio(card.id)"
        />
      </div>

      <p v-else class="text-sm text-dimmed">
        No Portfolio targets found.
      </p>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  usePortfolioInterface,
  type PortfolioSurface,
} from '../../../../composables/fireux/firestore/portfolio/utils/view/usePortfolioInterface'

const props = withDefaults(
  defineProps<{
    // Console target lists consume Portfolio interface surfaces; storage completeness belongs in the Firestore stack.
    collection?: PortfolioSurface[]
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
const { cell } = usePortfolioInterface()
const cards = computed(() =>
  props.collection
    .map((portfolio) => cell(portfolio))
    .filter((card): card is NonNullable<ReturnType<typeof cell>> =>
      Boolean(card)
    )
)

function selectPortfolio(id: string) {
  const portfolioId = String(id ?? '').trim()
  if (!consoleIdSet.value.has(portfolioId)) return
  emit('select', portfolioId)
}
</script>
