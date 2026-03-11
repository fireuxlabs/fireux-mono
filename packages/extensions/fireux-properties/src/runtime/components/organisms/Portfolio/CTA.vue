<template>
  <ConsoleEntityCTA
    title="Portfolio console"
    my-label="My Portfolios"
    test-label="Test Portfolio"
    read-only-label="Read-only Portfolios"
    learn-more-to="/portfolios/learn-more"
  >
    <template #my>
          <div v-if="livePills.length" class="space-y-2">
            <PortfolioCardsPill
              v-for="item in livePills"
              :key="item.id"
              :to="''"
              :title="item.title"
              :subtitle="item.subtitle"
              :badges="item.badges"
              :action="true"
              @action="goToPortfolio('live', item.id)"
            />
          </div>
          <UButton
            block
            variant="subtle"
            color="primary"
            icon="i-lucide-plus"
            @click="createPortfolio"
          >
            Create portfolio
          </UButton>
    </template>

    <template #test>
          <UButton
            block
            variant="subtle"
            color="primary"
            icon="i-lucide-flask-conical"
            @click="goToPortfolio('test')"
          >
            Enter Test Portfolio
          </UButton>
    </template>

    <template #readOnly>
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
import ConsoleEntityCTA from 'fireux-core/runtime/components/entities/console/ConsoleEntityCTA.vue'
import { getReadOnlyPortfolioScenarioList } from '../../../composables/fireux/app/portfolio-runtime/read-only-scenarios'
import type { RuntimePortfolioMode } from '../../../composables/fireux/app/portfolio-runtime/shared'
import { useRuntimePortfolioSelection } from '../../../composables/fireux/app/portfolio-runtime/state'
import { usePortfolioFetch } from '../../../composables/fireux/firestore/portfolio/fetch/usePortfolioFetch'
import { usePortfolioInterface } from '../../../composables/fireux/firestore/portfolio/utils/view/usePortfolioInterface'
import PortfolioCardsPill from './Cards/Pill.vue'

const props = withDefaults(defineProps<{
  createMode?: 'route' | 'inline'
}>(), {
  createMode: 'route',
})

const emit = defineEmits<{
  (event: 'create'): void
}>()

const router = useRouter()
const { runtimePortfolioId, setRuntimePortfolio } = useRuntimePortfolioSelection()
const { portfolios } = usePortfolioFetch()
const { pill } = usePortfolioInterface()

const livePills = computed(() =>
  (portfolios.value ?? [])
    .map((entry) => pill(entry))
    .filter((entry): entry is NonNullable<ReturnType<typeof pill>> => Boolean(entry))
)

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
  }))
)

const goToPortfolio = async (mode: RuntimePortfolioMode, portfolioId?: string) => {
  const fallback = String(runtimePortfolioId.value || '').trim()
  const resolvedId = String(portfolioId || fallback).trim()
  setRuntimePortfolio({ portfolioId: resolvedId, mode })
  await router.push('/console/portfolio/overview')
}

const createPortfolio = async () => {
  if (props.createMode === 'inline') {
    emit('create')
    return
  }

  await router.push({
    path: '/portfolios/create',
    query: {
      returnTo: '/console/portfolio/overview',
    },
  })
}
</script>
