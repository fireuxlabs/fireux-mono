<template>
  <ConsoleEntityCTA
    title="Portfolio console"
    entity="portfolio"
    console-to="/console/portfolio/overview"
    my-label="My Portfolio Consoles"
    test-label="Test Portfolio"
    read-only-label="Read-only Portfolios"
    learn-more-to="/portfolios/learn-more"
  >
    <template #myNote>
      <li>The live list only includes portfolios you can operate.</li>
      <li>
        {{ createActionLabel }} routes to
        <code>{{ createPath }}</code>.
      </li>
      <li>{{ createActionMeaning }}</li>
    </template>

    <template #my>
      <div class="space-y-2">
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
        <p v-else class="text-sm text-dimmed">
          No portfolio consoles yet.
        </p>
        <UButton
          block
          variant="subtle"
          color="primary"
          icon="i-lucide-plus"
          @click="createPortfolio"
        >
          {{ createActionLabel }}
        </UButton>
      </div>
    </template>

    <template #testNote>
      <li>Uses the shared portfolio test runtime instead of a live portfolio you operate.</li>
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

    <template #readOnlyNote>
      <li>Uses a selected read-only scenario id.</li>
      <li>Scenarios do not require live portfolio console authority.</li>
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
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { getReadOnlyPortfolioScenarioList } from '../../../composables/fireux/app/portfolio-runtime/read-only-scenarios'
import type { RuntimePortfolioMode } from '../../../composables/fireux/app/portfolio-runtime/shared'
import { useRuntimePortfolioSelection } from '../../../composables/fireux/app/portfolio-runtime/state'
import { usePortfolioFetch } from '../../../composables/fireux/firestore/portfolio/fetch/usePortfolioFetch'
import { usePortfolioInterface } from '../../../composables/fireux/firestore/portfolio/utils/view/usePortfolioInterface'
import type { PortfolioApp } from '../../../models/portfolio.model'
import PortfolioCardsPill from './Cards/Pill.vue'

const props = withDefaults(defineProps<{
  createSurface?: 'public' | 'console'
}>(), {
  createSurface: 'public',
})

const router = useRouter()
const { runtimePortfolioId, setRuntimePortfolio } = useRuntimePortfolioSelection()
const { portfolios } = usePortfolioFetch()
const { pill } = usePortfolioInterface()
const { uid } = useAuth()
const { appId } = useFireUXConfig()
const { firestoreFetchCollection } = useFirestoreRead()
const isConsoleCreateSurface = computed(() => props.createSurface === 'console')
const portfolioOverlays = appId
  ? firestoreFetchCollection<PortfolioApp>(`apps/${appId}/portfolios`)
  : null
const createPath = computed(() =>
  isConsoleCreateSurface.value ? '/console/portfolio/create' : '/portfolios/create'
)
const createActionLabel = computed(() => 'Create portfolio')
const createActionMeaning = computed(() =>
  isConsoleCreateSurface.value
    ? 'It creates the portfolio console overlay and creates the public portfolio only if it does not already exist.'
    : 'It creates the public portfolio first, not the console overlay directly.'
)

const accessiblePortfolioIds = computed(() => {
  const currentUid = String(uid.value || '').trim()
  if (!currentUid) return new Set<string>()

  const ids = new Set<string>()

  for (const overlay of portfolioOverlays?.value ?? []) {
    const id = String((overlay as any)?.id || '').trim()
    if (!id) continue
    if ((overlay as any)?.console_enabled === false) continue

    const adminIds = Array.isArray((overlay as any)?.admin_ids)
      ? (overlay as any).admin_ids
          .map((value: unknown) => String(value || '').trim())
          .filter(Boolean)
      : []

    if (adminIds.includes(currentUid)) {
      ids.add(id)
    }
  }

  return ids
})

const livePills = computed(() =>
  (portfolios.value ?? [])
    .filter((entry) =>
      accessiblePortfolioIds.value.has(String((entry as any)?.id || '').trim())
    )
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
  await router.push(createPath.value)
}
</script>
