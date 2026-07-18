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

          <UBadge v-if="isSettled" variant="soft">{{ cards.length }}</UBadge>
        </div>
      </template>

      <MoleculesStateCard
        v-if="resolvedOutcome === 'pending'"
        entity="portfolio targets"
        state="loading"
        surface="bare"
      />

      <MoleculesStateCard
        v-else-if="resolvedOutcome === 'error'"
        entity="portfolio targets"
        state="error"
        surface="bare"
        description="Portfolio targets could not be loaded. Please try again."
      />

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

      <MoleculesStateCard
        v-else-if="isSettled"
        entity="portfolio targets"
        state="empty"
        surface="bare"
        title="No Portfolio targets found"
        description="Portfolios you can access will appear here."
      />
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ConsoleTargetOutcome } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleIndex'
import {
  usePortfolioInterface,
  type PortfolioSurface,
} from '../../../../composables/fireux/firestore/portfolio/utils/view/usePortfolioInterface'

const props = withDefaults(
  defineProps<{
    // Console target lists consume Portfolio interface surfaces; storage completeness belongs in the Firestore stack.
    collection?: PortfolioSurface[]
    pending?: boolean
    outcome?: ConsoleTargetOutcome
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
const resolvedOutcome = computed<ConsoleTargetOutcome>(() => {
  if (props.outcome) return props.outcome
  if (props.pending) return 'pending'
  return cards.value.length ? 'ready' : 'empty'
})
const isSettled = computed(() =>
  resolvedOutcome.value === 'ready' || resolvedOutcome.value === 'empty'
)

function selectPortfolio(id: string) {
  const portfolioId = String(id ?? '').trim()
  if (!consoleIdSet.value.has(portfolioId)) return
  emit('select', portfolioId)
}
</script>
