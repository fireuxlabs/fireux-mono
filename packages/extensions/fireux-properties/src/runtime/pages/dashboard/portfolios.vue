<template>
  <UPage>
    <UPageHeader
      class="border-b-0"
      title="Portfolios"
      description="Select a portfolio runtime context before entering the Granite console."
    />

    <UPageBody class="pagebody space-y-6">
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

        <div class="space-y-3">
          <UButton
            size="sm"
            variant="soft"
            color="neutral"
            icon="i-lucide-eraser"
            @click="clearSelection"
          >
            Clear runtime selection
          </UButton>

          <p class="text-xs text-dimmed">
            Selection is explicit. Granite console routes do not auto-select fallback portfolios.
          </p>
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
                icon="i-lucide-check"
                @click="selectLive(item.id)"
              >
                Select
              </UButton>
            </div>
          </div>
        </div>

        <UAlert
          v-else
          color="neutral"
          variant="soft"
          title="No live portfolios found"
          description="Create portfolio documents to activate live runtime mode."
        />
      </UCard>

      <UCard>
        <template #header>
          <div class="space-y-1">
            <div class="text-sm font-semibold">Read-only demo scenarios</div>
            <div class="text-xs text-dimmed">
              Explicitly choose a demo scenario to run Granite in read-only mode.
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
                <div class="text-xs text-dimmed">
                  Managed by {{ scenario.manager_display_name || 'Unknown manager' }}
                </div>
                <div class="text-xs text-dimmed">{{ scenario.label }}</div>
                <div class="text-xs text-dimmed">
                  {{ scenario.property_count }} properties · {{ scenario.unit_count }} units ·
                  {{ scenario.task_count }} tasks
                </div>
              </div>

              <UButton
                size="sm"
                variant="soft"
                icon="i-lucide-flask-conical"
                @click="selectReadOnly(scenario.id)"
              >
                Select demo
              </UButton>
            </div>
          </div>
        </div>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead, useRouter } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { computed } from 'vue'
import { useRuntimePortfolioSelection } from '../../composables/fireux/app/portfolio-runtime/state'
import { getReadOnlyPortfolioScenarioList } from '../../composables/fireux/app/portfolio-runtime/read-only-scenarios'
import { usePortfolioCollection } from '../../composables/fireux/firestore/portfolio/fetch/usePortfolioCollection'
import { usePortfolioInterface } from '../../composables/fireux/firestore/portfolio/utils/view/usePortfolioInterface'

definePageMeta({
  layout: 'dashboard',
  title: 'Portfolios',
  description: 'Select a Granite portfolio runtime context.',
  nav: {
    visibility: { ecosystems: ['granite'], modules: ['fireux-properties'] },
    key: 'dashboard-portfolios',
    label: 'Portfolios',
    icon: 'i-lucide-building',
    order: 35,
    desktop: true,
    mobile: true,
    layouts: ['dashboard'],
  },
  requiresAuth: true,
  name: 'DashboardPortfoliosIndexPage',
})

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | Portfolios` })

const router = useRouter()
const {
  runtimePortfolioId,
  runtimePortfolioMode,
  setRuntimePortfolio,
  clearRuntimePortfolio,
} = useRuntimePortfolioSelection()
const { collection } = usePortfolioCollection()
const { card } = usePortfolioInterface()

const liveCards = computed(() =>
  collection.value
    .map((entry) => card(entry))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
)

const demoScenarios = getReadOnlyPortfolioScenarioList()

const selectLive = async (portfolioId: string) => {
  setRuntimePortfolio({ portfolioId, mode: 'live' })
  await router.push('/console/portfolio')
}

const selectReadOnly = async (portfolioId: string) => {
  setRuntimePortfolio({ portfolioId, mode: 'read-only' })
  await router.push('/console/portfolio')
}

const clearSelection = () => {
  clearRuntimePortfolio()
}
</script>
