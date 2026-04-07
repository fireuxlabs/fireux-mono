<template>
  <ConsoleEntityCTA
    title="Portfolio console"
    console-to="/console/portfolio"
    demo-label="Demo Portfolios"
    learn-more-to="/portfolios/learn-more"
  >
    <template #demoNote>
      <li>Uses bundled portfolio demo scenarios only.</li>
    </template>

    <template #demo>
      <div v-if="scenarioCards.length" class="space-y-2">
        <PortfolioCardsPill
          v-for="item in scenarioCards"
          :key="item.id"
          v-bind="item"
          :link="false"
          :action="true"
          :show-badges="false"
          class="cursor-pointer"
          @action="openScenario(item.id)"
        />
      </div>
      <p v-else class="text-sm text-dimmed">
        No demo portfolios.
      </p>
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
  </ConsoleEntityCTA>
</template>

<script setup lang="ts">
import { useRouter } from '#imports'
import { computed } from 'vue'
import { getDemoPortfolioScenarioList } from '../../../composables/fireux/app/portfolio-console/demo-scenarios'
import { usePortfolioSelection } from '../../../composables/fireux/app/portfolio-console/usePortfolioSelection'

const router = useRouter()
const { setRuntimePortfolio } = usePortfolioSelection()

const scenarioCards = computed(() =>
  getDemoPortfolioScenarioList().map((entry) => ({
    id: String(entry.id || '').trim(),
    title: String(entry.name || '').trim(),
    subtitle: String(entry.manager_display_name || entry.label || '').trim(),
    imageUrl: String(entry.manager_avatar_url || entry.image_url || '').trim(),
    badges: [],
  }))
)

const openScenario = async (portfolioId: string) => {
  const resolvedId = String(portfolioId || '').trim()
  if (!resolvedId) return

  setRuntimePortfolio({ portfolioId: resolvedId, mode: 'demo' })
  await router.push('/console/portfolio')
}
</script>
