<template>
  <UDashboardPanel id="console-portfolio-overview">
    <template #header>
      <LayoutsConsoleNavbar title="Portfolio Overview" />
    </template>

    <template #body>
      <section class="space-y-6">
        <UAlert
          v-if="!runtime.id"
          color="neutral"
          variant="soft"
          title="No portfolio selected"
          description="Select a portfolio on /console/portfolio before opening the portfolio overview."
          :actions="[
            {
              label: 'Go to portfolios',
              to: '/console/portfolio',
              icon: 'i-lucide-arrow-right',
            },
          ]"
        />

        <template v-else>
          <div class="flex flex-wrap items-center gap-3">
            <PortfolioCardsPill
              v-if="activePortfolioPill"
              v-bind="activePortfolioPill"
              :link="false"
              :show-badges="false"
            />
            <UBadge color="neutral" variant="soft" size="lg">
              {{ modeLabel }} Mode
            </UBadge>
          </div>

          <UCard>
            <template #header>
              <div class="text-sm font-semibold">Workspace Summary</div>
            </template>

            <div class="grid gap-3 sm:grid-cols-4">
              <div class="space-y-1">
                <div class="text-xs uppercase tracking-[0.16em] text-toned">Mode</div>
                <div class="text-sm font-medium">{{ modeLabel }}</div>
              </div>

              <div class="space-y-1">
                <div class="text-xs uppercase tracking-[0.16em] text-toned">Source</div>
                <div class="text-sm font-medium">{{ sourceLabel }}</div>
              </div>

              <div class="space-y-1">
                <div class="text-xs uppercase tracking-[0.16em] text-toned">Portfolio Id</div>
                <div class="font-mono text-sm">{{ runtime.id }}</div>
              </div>

              <div class="space-y-1">
                <div class="text-xs uppercase tracking-[0.16em] text-toned">Is Premium</div>
                <div class="text-sm font-medium">{{ isPremium ? 'true' : 'false' }}</div>
              </div>
            </div>
          </UCard>

          <UCard v-if="showDemoPremiumPreviewToggle">
            <div class="flex items-center justify-between gap-4">
              <div class="space-y-1">
                <div class="text-sm font-semibold">Preview Premium Real Summary</div>
                <p class="text-sm text-dimmed">
                  Show what premium real portfolio collection insights can look like.
                </p>
              </div>

              <USwitch v-model="showPremiumPreview" />
            </div>
          </UCard>

          <UCard v-if="showPremiumCollectionSummary">
            <template #header>
              <div class="text-sm font-semibold">Premium Collection Summary</div>
            </template>

            <div class="space-y-1">
              <div class="text-xs uppercase tracking-[0.16em] text-toned">Total Portfolios</div>
              <div class="text-sm font-medium">{{ livePortfolioCount }}</div>
            </div>
          </UCard>

          <UCard v-else-if="showDemoPremiumCollectionPreview">
            <template #header>
              <div class="text-sm font-semibold">Premium Real Preview</div>
            </template>

            <div class="space-y-3">
              <div class="space-y-1">
                <div class="text-xs uppercase tracking-[0.16em] text-toned">Total Portfolios</div>
                <div class="text-sm font-medium">{{ demoPortfolioCount }}</div>
              </div>

              <p class="text-sm text-dimmed">
                Preview only. Premium real mode can surface live collection summaries like this.
              </p>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <div class="text-sm font-semibold">Portfolio Areas</div>
            </template>

            <div class="flex flex-wrap gap-2">
              <UButton to="/console/portfolio/properties" color="neutral" variant="soft" icon="i-lucide-building">
                Properties
              </UButton>
              <UButton to="/console/portfolio/clients" color="neutral" variant="soft" icon="i-lucide-users">
                Clients
              </UButton>
              <UButton to="/console/portfolio/incidents" color="neutral" variant="soft" icon="i-lucide-triangle-alert">
                Incidents
              </UButton>
              <UButton to="/console/portfolio/finance" color="neutral" variant="soft" icon="i-lucide-wallet">
                Finance
              </UButton>
              <UButton to="/console/portfolio" color="neutral" variant="ghost" icon="i-lucide-refresh-cw">
                Switch portfolio
              </UButton>
            </div>
          </UCard>
        </template>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useState } from '#imports'
import { computed, ref, watchEffect } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import type { Portfolio } from '../../../models/portfolio.model'
import { useRuntimePortfolioConsole } from '../../../composables/fireux/app/portfolio-runtime/useRuntimePortfolioConsole'
import { useRuntimePortfolio } from '../../../composables/fireux/app/portfolio-runtime/useRuntimePortfolio'
import { useRuntimePortfolioSelection } from '../../../composables/fireux/app/portfolio-runtime/state'
import { usePortfolioCollection } from '../../../composables/fireux/firestore/portfolio/fetch/usePortfolioCollection'
import { usePortfolioInterface } from '../../../composables/fireux/firestore/portfolio/utils/view/usePortfolioInterface'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-properties'] },
    key: 'console-portfolio-overview',
    label: 'Overview',
    icon: 'i-lucide-house',
    order: 0,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const normalizeString = (value: unknown): string => String(value || '').trim()
const stripTestPortfolioSuffix = (value: unknown): string =>
  normalizeString(value).replace(/\s+test portfolio$/i, '').trim()
const { scenarios } = useRuntimePortfolioConsole()
const runtime = useRuntimePortfolio()
const portfolioSelection = useRuntimePortfolioSelection()
const { currentUser } = useAuth()
const { isPremium } = useUser()
const { count: livePortfolioCount } = usePortfolioCollection()
const { pill: toPortfolioCard } = usePortfolioInterface()

type PortfolioPill = NonNullable<ReturnType<typeof toPortfolioCard>> & {
  imageUrl?: string
}

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
      portfolioSelection.mode.value === 'test'
        ? normalizeString(currentUser.value?.displayName) ||
          stripTestPortfolioSuffix(target?.name) ||
          'Your'
        : pill.title,
    subtitle:
      portfolioSelection.mode.value === 'test'
        ? 'Test Portfolio'
        : pill.subtitle,
  }
}

const activePortfolioPill = computed(() =>
  buildPortfolioPill(
    runtime.portfolio.value as Portfolio | null,
    runtime.scenario.value?.manager.avatar_url
  )
)

const modeLabel = computed(() => {
  if (portfolioSelection.mode.value === 'live') return 'Real'
  if (portfolioSelection.mode.value === 'test') return 'Test'
  return 'Demo'
})

const sourceLabel = computed(() => {
  if (portfolioSelection.mode.value === 'live') return 'Firestore production data'
  if (portfolioSelection.mode.value === 'test') return 'Firestore test data'
  return 'Curated demo scenario'
})
const showPremiumPreview = ref(false)
const demoPortfolioCount = computed(() => scenarios.value.length)
const showPremiumCollectionSummary = computed(() =>
  portfolioSelection.mode.value === 'live' && isPremium.value
)
const showDemoPremiumPreviewToggle = computed(() =>
  portfolioSelection.mode.value === 'demo' && !isPremium.value
)
const showDemoPremiumCollectionPreview = computed(() =>
  portfolioSelection.mode.value === 'demo' &&
  (isPremium.value || showPremiumPreview.value)
)

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
</script>
