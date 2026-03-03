<template>
  <UPageCTA title="Portfolio console" orientation="horizontal">
    <template #links>
      <div class="grid gap-3 sm:grid-cols-3">
        <section class="space-y-2">
          <p class="text-sm font-semibold">My Portfolios</p>
          <div v-if="myPortfolioCards.length" class="space-y-2">
            <UButton
              v-for="item in myPortfolioCards"
              :key="`live-${item.id}`"
              block
              variant="subtle"
              color="primary"
              icon="i-lucide-building"
              @click="goToPortfolio('live', item.id)"
            >
              {{ item.title || item.id }}
            </UButton>
          </div>
          <p v-else class="text-sm text-dimmed">No portfolios linked yet.</p>
        </section>

        <section class="space-y-2">
          <p class="text-sm font-semibold">Test Portfolios</p>
          <div v-if="testCards.length" class="space-y-2">
            <UButton
              v-for="item in testCards"
              :key="`test-${item.id}`"
              block
              variant="subtle"
              color="primary"
              icon="i-lucide-flask-conical"
              @click="goToPortfolio('test', item.id)"
            >
              {{ item.title || item.id }}
            </UButton>
          </div>
          <p v-else class="text-sm text-dimmed">No test portfolios available.</p>
        </section>

        <section class="space-y-2">
          <p class="text-sm font-semibold">Read-only Portfolio</p>
          <UButton
            v-if="readOnlyScenario"
            block
            variant="subtle"
            color="primary"
            icon="i-lucide-lock"
            @click="goToPortfolio('read-only', readOnlyScenario.id)"
          >
            {{ readOnlyScenario.name }}
          </UButton>
          <p v-else class="text-sm text-dimmed">No read-only portfolio loaded.</p>
        </section>
      </div>
    </template>

    <template #default>
      <img
        src="https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=640&h=520&q=80"
        width="640"
        height="520"
        alt="Portfolio operations"
        class="w-full rounded-lg object-cover"
        loading="lazy"
      />
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
import { useRouter } from '#imports'
import { computed } from 'vue'
import { getReadOnlyPortfolioScenarioList } from '../../../composables/fireux/app/portfolio-runtime/read-only-scenarios'
import type { RuntimePortfolioMode } from '../../../composables/fireux/app/portfolio-runtime/shared'
import { useRuntimePortfolioSelection } from '../../../composables/fireux/app/portfolio-runtime/state'
import { usePortfolioCollection } from '../../../composables/fireux/firestore/portfolio/fetch/usePortfolioCollection'
import { usePortfolioInterface } from '../../../composables/fireux/firestore/portfolio/utils/view/usePortfolioInterface'

const router = useRouter()
const { setRuntimePortfolio } = useRuntimePortfolioSelection()
const { collection: liveCollection } = usePortfolioCollection()
const { collection: testCollection } = usePortfolioCollection({ collectionPath: 'test-portfolios' })
const { card } = usePortfolioInterface()

const myPortfolioCards = computed(() =>
  liveCollection.value
    .map((entry) => card(entry))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
)
const testCards = computed(() =>
  testCollection.value
    .map((entry) => card(entry))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
)
const demoScenarios = getReadOnlyPortfolioScenarioList()
const readOnlyScenario = computed(() => demoScenarios[0] ?? null)

const goToPortfolio = async (mode: RuntimePortfolioMode, portfolioId: string) => {
  const resolvedId = String(portfolioId || '').trim()
  setRuntimePortfolio({ portfolioId: resolvedId, mode })
  await router.push('/console/portfolio')
}
</script>
