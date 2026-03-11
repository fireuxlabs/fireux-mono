<template>
  <div />
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useRuntimePortfolioSelection } from 'fireux-properties/runtime/composables/fireux/app/portfolio-runtime/state'

definePageMeta({
  layout: 'granite-console',
  requiresAuth: true,
})

const { firestoreFetchCollection } = useFirestoreRead()
const portfolios = firestoreFetchCollection<{ id?: string }>('portfolios')
const { runtimePortfolioId, setRuntimePortfolio } = useRuntimePortfolioSelection()

const deadline = Date.now() + 1500
while (portfolios.value === undefined && Date.now() < deadline) {
  await new Promise((resolve) => setTimeout(resolve, 50))
}

const livePortfolios = portfolios.value ?? []
const selectedId = String(runtimePortfolioId.value || '').trim()
const fallbackId = String(livePortfolios[0]?.id || '').trim()
const resolvedId =
  livePortfolios.some((entry) => String(entry?.id || '').trim() === selectedId)
    ? selectedId
    : fallbackId

if (!resolvedId) {
  await navigateTo('/console/portfolio/create', { replace: true })
} else {
  setRuntimePortfolio({ portfolioId: resolvedId, mode: 'live' })
  await navigateTo('/console/portfolio/overview', { replace: true })
}
</script>
