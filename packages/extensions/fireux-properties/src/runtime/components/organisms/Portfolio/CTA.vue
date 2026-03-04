<template>
  <UPageCTA title="Portfolio console" orientation="horizontal">
    <template #links>
      <div class="grid gap-3 sm:grid-cols-3">
        <section class="space-y-2">
          <p class="text-sm font-semibold">My Portfolios</p>
          <UButton
            block
            variant="subtle"
            color="primary"
            icon="i-lucide-building"
            @click="goToPortfolio('live')"
          >
            Open my portfolio
          </UButton>
        </section>

        <section class="space-y-2">
          <p class="text-sm font-semibold">Test Portfolios</p>
          <UButton
            block
            variant="subtle"
            color="primary"
            icon="i-lucide-flask-conical"
            @click="goToPortfolio('test')"
          >
            Open test portfolio
          </UButton>
        </section>

        <section class="space-y-2">
          <p class="text-sm font-semibold">Read-only Portfolios</p>
          <div v-if="readOnlyPills.length" class="space-y-2">
            <PortfolioCardsPill
              v-for="item in readOnlyPills"
              :key="item.id"
              v-bind="item"
              :link="false"
              :action="true"
              :show-badges="false"
              class="cursor-pointer"
              @action="goToPortfolio('read-only', item.id)"
            />
          </div>
          <p v-else class="text-sm text-dimmed">
            No read-only portfolios.
          </p>
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
import PortfolioCardsPill from './Cards/Pill.vue'

const router = useRouter()
const { runtimePortfolioId, setRuntimePortfolio } = useRuntimePortfolioSelection()

const readOnlyScenarios = computed(() =>
  getReadOnlyPortfolioScenarioList()
    .map((entry) => ({
      id: String(entry.id || '').trim(),
      name: String(entry.name || '').trim(),
      subtitle: String(entry.manager_display_name || '').trim(),
      imageUrl: String(entry.manager_avatar_url || entry.image_url || '').trim(),
    }))
    .filter((entry) => Boolean(entry.id))
)

const readOnlyPills = computed(() =>
  readOnlyScenarios.value.map((entry) => ({
    id: entry.id,
    to: '',
    title: entry.name,
    subtitle: entry.subtitle,
    imageUrl: entry.imageUrl,
    badges: ['Read-only'],
  }))
)

const goToPortfolio = async (mode: RuntimePortfolioMode, portfolioId?: string) => {
  const fallback = String(runtimePortfolioId.value || '').trim()
  const resolvedId = String(portfolioId || fallback).trim()
  setRuntimePortfolio({ portfolioId: resolvedId, mode })
  await router.push('/console/portfolio')
}
</script>
