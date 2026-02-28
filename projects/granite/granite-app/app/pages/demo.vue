<template>
  <div class="py-8 sm:py-10 lg:py-12">
    <UContainer class="space-y-6">
      <UPageHeader
        title="Granite demo runtime"
        description="Choose a read-only scenario or a live portfolio before entering the console."
      />

      <UCard>
        <template #header>
          <div class="space-y-1">
            <div class="text-sm font-semibold">Current runtime selection</div>
            <div class="text-xs text-dimmed">
              Portfolio ID:
              <span class="font-mono">{{ runtimePortfolioId || 'none' }}</span>
              · Mode:
              <span class="font-medium">{{ runtimePortfolioMode }}</span>
            </div>
          </div>
        </template>

        <div class="flex flex-wrap gap-3">
          <UButton
            size="sm"
            variant="soft"
            color="neutral"
            icon="i-lucide-eraser"
            @click="clearRuntimePortfolio"
          >
            Clear runtime
          </UButton>
          <UButton
            to="/portfolios"
            size="sm"
            variant="soft"
            color="neutral"
            icon="i-lucide-list"
          >
            Open full selector
          </UButton>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="space-y-1">
            <div class="text-sm font-semibold">Read-only demo scenarios</div>
            <div class="text-xs text-dimmed">
              Immutable sample portfolios for walkthroughs and demos.
            </div>
          </div>
        </template>

        <div class="space-y-3">
          <div
            v-for="scenario in demoScenarios"
            :key="scenario.id"
            class="rounded border border-default p-3"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="space-y-1">
                <div class="text-sm font-semibold">{{ scenario.name }}</div>
                <div class="text-xs text-dimmed">{{ scenario.label }}</div>
              </div>

              <UButton
                size="sm"
                variant="soft"
                icon="i-lucide-flask-conical"
                @click="openReadOnlyScenario(scenario.id)"
              >
                Run demo
              </UButton>
            </div>
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="space-y-1">
            <div class="text-sm font-semibold">Live portfolios</div>
            <div class="text-xs text-dimmed">
              Firestore-backed portfolios from <code>portfolios/{portfolioId}</code>.
            </div>
          </div>
        </template>

        <div v-if="liveCards.length" class="space-y-3">
          <div
            v-for="item in liveCards"
            :key="item.id"
            class="rounded border border-default p-3"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="space-y-1">
                <div class="text-sm font-semibold">{{ item.title }}</div>
                <div class="text-xs text-dimmed">{{ item.subtitle || 'No region label' }}</div>
                <div class="text-xs text-dimmed">
                  Owner: {{ item.ownerLabel || 'Unset' }} · Status: {{ item.status || 'unknown' }}
                </div>
              </div>

              <UButton
                size="sm"
                icon="i-lucide-building"
                @click="openLivePortfolio(item.id)"
              >
                Open live
              </UButton>
            </div>
          </div>
        </div>

        <UAlert
          v-else
          color="neutral"
          variant="soft"
          title="No live portfolios found"
          description="Use the read-only scenario above, or seed portfolio documents first."
        />
      </UCard>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from '#imports'
import { useRuntimePortfolioSelection } from 'fireux-properties/runtime/composables/fireux/app/portfolio-runtime/state'
import { usePortfolioCollection } from 'fireux-properties/runtime/composables/fireux/firestore/portfolio/fetch/usePortfolioCollection'
import { usePortfolioInterface } from 'fireux-properties/runtime/composables/fireux/firestore/portfolio/utils/view/usePortfolioInterface'

definePageMeta({
  layout: 'landing',
  nav: {
    key: 'demo',
    label: 'Demo',
    icon: 'i-lucide-flask-conical',
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: 'Granite Demo — Portfolio runtime selector',
  description:
    'Launch Granite in read-only demo mode or select a live portfolio runtime before opening the console.',
})

const router = useRouter()
const { runtimePortfolioId, runtimePortfolioMode, setRuntimePortfolio, clearRuntimePortfolio } =
  useRuntimePortfolioSelection()
const { collection } = usePortfolioCollection()
const { card } = usePortfolioInterface()

const demoScenarios = [
  {
    id: 'granite-demo-core',
    name: 'Granite Demo Portfolio',
    label: 'Greater London',
    mode: 'read-only' as const,
  },
]

const isDefined = <T,>(value: T | null | undefined): value is T => Boolean(value)

const liveCards = computed(() =>
  collection.value.map((entry) => card(entry)).filter(isDefined)
)

const openReadOnlyScenario = async (portfolioId: string) => {
  setRuntimePortfolio({ portfolioId, mode: 'read-only' })
  await router.push('/console/portfolio')
}

const openLivePortfolio = async (portfolioId: string) => {
  setRuntimePortfolio({ portfolioId, mode: 'live' })
  await router.push('/console/portfolio')
}
</script>
