<template>
  <UDashboardPanel id="console-portfolio-home">
    <template #header>
      <LayoutsConsoleNavbar title="Portfolio">
        <template #right>
          <UButton
            v-if="runtime.id"
            color="neutral"
            variant="ghost"
            icon="i-lucide-x"
            @click="clearSelection"
          >
            Clear
          </UButton>
        </template>
      </LayoutsConsoleNavbar>
    </template>

    <template #body>
      <section class="space-y-4">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-[11px] font-semibold uppercase tracking-[0.16em] text-toned">
            Mode
          </span>

          <div class="inline-flex items-center gap-1 rounded-lg border border-default bg-default/60 p-1">
            <UButton
              v-for="option in modeOptions"
              :key="option.value"
              size="xs"
              :color="selectedMode === option.value ? 'primary' : 'neutral'"
              :variant="selectedMode === option.value ? 'solid' : 'ghost'"
              :aria-pressed="selectedMode === option.value"
              @click="selectMode(option.value)"
            >
              {{ option.label }}
            </UButton>
          </div>
        </div>

        <UAlert
          v-if="activePortfolioPill"
          color="primary"
          variant="soft"
          :title="activePortfolioPill.title"
          :description="activePortfolioPill.subtitle || ''"
        />

        <UAlert
          v-else-if="availablePortfolioPills.length"
          color="neutral"
          variant="soft"
          :title="selectTitle"
        />

        <UAlert
          v-else
          color="neutral"
          variant="soft"
          :title="emptyTitle"
        />

        <div v-if="availablePortfolioPills.length" class="space-y-2">
          <PortfolioCardsPill
            v-for="item in availablePortfolioPills"
            :key="item.id"
            v-bind="item"
            :link="false"
            :action="true"
            :show-badges="false"
            class="cursor-pointer"
            @action="selectPortfolio(item.id)"
          />
        </div>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useState } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type { Portfolio } from '../../../models/portfolio.model'
import { usePortfolioCollection } from '../../../composables/fireux/firestore/portfolio/fetch/usePortfolioCollection'
import { usePortfolioCreate } from '../../../composables/fireux/firestore/portfolio/mutations/usePortfolioCreate'
import { useRuntimePortfolioSelection } from '../../../composables/fireux/app/portfolio-runtime/state'
import { usePortfolioInterface } from '../../../composables/fireux/firestore/portfolio/utils/view/usePortfolioInterface'
import { computed, ref, watch, watchEffect } from 'vue'
import { useRuntimePortfolioConsole } from '../../../composables/fireux/app/portfolio-runtime/useRuntimePortfolioConsole'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-properties'] },
    key: 'console-portfolio',
    label: 'Portfolio',
    icon: 'i-lucide-layout-dashboard',
    order: 900,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const modeOptions = [
  { value: 'read-only', label: 'Demo' },
  { value: 'live', label: 'Real' },
  { value: 'test', label: 'Test' },
] as const

const normalizeString = (value: unknown): string => String(value || '').trim()
const stripTestPortfolioSuffix = (value: unknown): string =>
  normalizeString(value).replace(/\s+test portfolio$/i, '').trim()

const { runtime, scenarios } = useRuntimePortfolioConsole()
const portfolioSelection = useRuntimePortfolioSelection()
const { uid, currentUser, isAuthenticated, hasAuthState } = useAuth()
const { ensurePortfolio } = usePortfolioCreate({ test: true })
const { pill: toPortfolioCard } = usePortfolioInterface()
const { collection: livePortfolios } = usePortfolioCollection()
const { collection: testPortfolios } = usePortfolioCollection({ collectionPath: 'test-portfolios' })
const selectedMode = portfolioSelection.mode

type PortfolioPill = NonNullable<ReturnType<typeof toPortfolioCard>> & {
  imageUrl?: string
}
type ConsoleMode = (typeof modeOptions)[number]['value']

const buildPortfolioPill = (
  target?: Portfolio | null,
  imageUrl?: unknown
): PortfolioPill | null => {
  const pill = toPortfolioCard(target as Portfolio | null)
  if (!pill) return null

  return {
    ...pill,
    imageUrl: normalizeString(imageUrl) || pill.avatarUrl,
    title:
      selectedMode.value === 'test'
        ? normalizeString(currentUser.value?.displayName) ||
          stripTestPortfolioSuffix(target?.name) ||
          'Your'
        : pill.title,
    subtitle:
      selectedMode.value === 'test'
        ? 'Test Portfolio'
        : pill.subtitle,
  }
}

const demoPortfolioPills = computed(() =>
  scenarios.value
    .map((entry) => buildPortfolioPill(entry.portfolio as Portfolio, entry.manager.avatar_url))
    .filter((entry): entry is PortfolioPill => Boolean(entry))
)

const livePortfolioPills = computed(() =>
  livePortfolios.value
    .map((entry) => buildPortfolioPill(entry as Portfolio))
    .filter((entry): entry is PortfolioPill => Boolean(entry))
)

const ownedTestPortfolios = computed(() => {
  const currentUid = normalizeString(uid.value)
  if (!currentUid) return []
  return testPortfolios.value.filter((entry) => normalizeString(entry?.id) === currentUid)
})

const testPortfolioPills = computed(() =>
  ownedTestPortfolios.value
    .map((entry) => buildPortfolioPill(entry as Portfolio))
    .filter((entry): entry is PortfolioPill => Boolean(entry))
)

const availablePortfolioPills = computed(() => {
  if (selectedMode.value === 'live') return livePortfolioPills.value
  if (selectedMode.value === 'test') return testPortfolioPills.value
  return demoPortfolioPills.value
})

const activePortfolioPill = computed(() =>
  availablePortfolioPills.value.find((item) => item.id === runtime.id.value) ??
  buildPortfolioPill(
    runtime.portfolio.value as Portfolio | null,
    runtime.scenario.value?.manager.avatar_url
  )
)
const selectTitle = computed(() => {
  if (selectedMode.value === 'live') return 'Select a real portfolio'
  if (selectedMode.value === 'test') return 'Select a test portfolio'
  return 'Select a demo portfolio'
})
const emptyTitle = computed(() => {
  if (selectedMode.value === 'live') return 'No real portfolios'
  if (selectedMode.value === 'test') return 'No test portfolios'
  return 'No demo portfolios'
})

const consoleHeader = useState<{ component: string; props: Record<string, unknown> } | null>(
  'console-header-pill',
  () => null
)

watchEffect(() => {
  consoleHeader.value = activePortfolioPill.value
    ? {
        component: 'PortfolioCardsPill',
        props: {
          ...activePortfolioPill.value,
          link: false,
          showBadges: false,
        },
      }
    : null
})

if (import.meta.client) {
  const ensuringTestPortfolio = ref(false)
  const ensuredTestPortfolioUid = ref('')

  watch(
    [selectedMode, hasAuthState, isAuthenticated, uid],
    async ([mode, authReady, authenticated, currentUid]) => {
      const resolvedUid = normalizeString(currentUid)
      if (mode !== 'test') return
      if (!authReady || !authenticated || !resolvedUid) return
      if (ensuringTestPortfolio.value) return
      if (ensuredTestPortfolioUid.value === resolvedUid) return

      ensuringTestPortfolio.value = true
      try {
        const ownerName = normalizeString(currentUser.value?.displayName) || 'Your'
        await ensurePortfolio(
          {
            name: `${ownerName} Test Portfolio`,
            slug: resolvedUid,
            owner_label: ownerName,
            status: 'active',
            strategy_label: '',
            region_label: '',
            notes: '',
          },
          {
            mode: 'public',
            existingRootId: resolvedUid,
          }
        )
        ensuredTestPortfolioUid.value = resolvedUid
      } finally {
        ensuringTestPortfolio.value = false
      }
    },
    { immediate: true }
  )
}

const selectPortfolio = (portfolioId: string) => {
  const resolvedId = normalizeString(portfolioId)
  if (!resolvedId) return
  portfolioSelection.setRuntimePortfolio({
    portfolioId: resolvedId,
    mode: selectedMode.value,
  })
}

const selectMode = (mode: ConsoleMode) => {
  portfolioSelection.setRuntimePortfolio({
    mode,
  })
}

const clearSelection = () => {
  portfolioSelection.setRuntimePortfolio({
    selectedId: '',
    mode: selectedMode.value,
  })
}
</script>
