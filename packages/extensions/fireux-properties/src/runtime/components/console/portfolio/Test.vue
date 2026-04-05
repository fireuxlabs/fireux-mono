<template>
  <section class="space-y-4">
    <ConsoleRootSelectionStatus
      :has-selection="Boolean(activePortfolioPill)"
      :has-options="testPortfolioPills.length > 0"
      select-title="Select a test portfolio"
      empty-title="No test portfolios"
    >
      <template #selected>
        <UAlert
          color="primary"
          variant="soft"
          :title="activePortfolioPill?.title || ''"
          :description="activePortfolioPill?.subtitle || ''"
        />
      </template>
    </ConsoleRootSelectionStatus>

    <div v-if="testPortfolioPills.length" class="space-y-2">
      <PortfolioCardsPill
        v-for="item in testPortfolioPills"
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

<script setup lang="ts">
import { useState } from '#imports'
import { computed, ref, watch, watchEffect } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type { Portfolio } from '../../../models/portfolio.model'
import { usePortfolioCollection } from '../../../composables/fireux/firestore/portfolio/fetch/usePortfolioCollection'
import { usePortfolioCreate } from '../../../composables/fireux/firestore/portfolio/mutations/usePortfolioCreate'
import { useRuntimePortfolioSelection } from '../../../composables/fireux/app/portfolio-runtime/state'
import { usePortfolioInterface } from '../../../composables/fireux/firestore/portfolio/utils/view/usePortfolioInterface'
import { useRuntimePortfolioConsole } from '../../../composables/fireux/app/portfolio-runtime/useRuntimePortfolioConsole'

const normalizeString = (value: unknown): string => String(value || '').trim()
const stripTestPortfolioSuffix = (value: unknown): string =>
  normalizeString(value).replace(/\s+test portfolio$/i, '').trim()

const { runtime } = useRuntimePortfolioConsole()
const portfolioSelection = useRuntimePortfolioSelection()
const { uid, currentUser, isAuthenticated, hasAuthState } = useAuth()
const { ensurePortfolio } = usePortfolioCreate({ test: true })
const { pill: toPortfolioCard } = usePortfolioInterface()
const { collection: testPortfolios } = usePortfolioCollection({ collectionPath: 'test-portfolios' })

type PortfolioPill = NonNullable<ReturnType<typeof toPortfolioCard>> & { imageUrl?: string }

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
      normalizeString(currentUser.value?.displayName) ||
      stripTestPortfolioSuffix(target?.name) ||
      'Your',
    subtitle: 'Test Portfolio',
  }
}

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

const activePortfolioPill = computed(() =>
  testPortfolioPills.value.find((item) => item.id === runtime.id.value) ??
  buildPortfolioPill(runtime.portfolio.value as Portfolio | null)
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

if (import.meta.client) {
  const ensuringTestPortfolio = ref(false)
  const ensuredTestPortfolioUid = ref('')

  watch(
    [hasAuthState, isAuthenticated, uid],
    async ([authReady, authenticated, currentUid]) => {
      const resolvedUid = normalizeString(currentUid)
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
    mode: 'test',
  })
}
</script>
