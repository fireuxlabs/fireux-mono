<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <div class="text-sm font-semibold">{{ title }}</div>
        <div v-if="description" class="text-xs text-dimmed">{{ description }}</div>
      </div>
    </template>

    <div v-if="cards.length" class="space-y-3">
      <div
        v-for="item in cards"
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

          <UButton size="sm" icon="i-lucide-check" @click="select(item.id)">
            Select
          </UButton>
        </div>
      </div>
    </div>

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      title="No portfolios found"
      description="Create portfolio documents to activate runtime selection."
    />
  </UCard>
</template>

<script setup lang="ts">
import { useRouter } from '#imports'
import { computed } from 'vue'
import { useRuntimePortfolioSelection } from '../../../../composables/fireux/app/portfolio-runtime/state'
import { usePortfolioInterface } from '../../../../composables/fireux/firestore/portfolio/utils/view/usePortfolioInterface'
import type { Portfolio } from '../../../../models/portfolio.model'

const props = withDefaults(
  defineProps<{
    collection?: Portfolio[]
    title?: string
    description?: string
  }>(),
  {
    title: 'Available Portfolios',
    description: '',
  }
)

const router = useRouter()
const { setRuntimePortfolio } = useRuntimePortfolioSelection()
const { card } = usePortfolioInterface()

const cards = computed(() =>
  (props.collection ?? [])
    .map((entry) => card(entry))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
)

const select = async (portfolioId: string) => {
  const resolvedId = String(portfolioId || '').trim()
  setRuntimePortfolio({ portfolioId: resolvedId, mode: 'live' })
  await router.push('/console/portfolio/overview')
}
</script>
