<!-- FILE: packages/extensions/fireux-jobs/src/runtime/components/dev/Job/Dummy.vue -->

<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">Job card surfaces</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">Pill, preview, cell, and profile variants with a real-looking payload.</p>
      </div>
    </template>

    <div class="space-y-4">
      <div class="flex flex-wrap gap-2">
        <JobCardsPill
          v-for="(item, index) in pillItems"
          :key="item.key"
          v-bind="item.pill"
          action
          @action="selectedIndex = index"
        />
      </div>

      <JobCardsPreview
        v-if="currentPreview"
        :image-url="currentPreview.imageUrl"
        :title="currentPreview.title"
        :subtitle="currentPreview.subtitle"
        :badges="currentPreview.badges"
        :prop="currentPreview.prop"
      />

      <JobCardsCell v-if="currentCell" v-bind="currentCell" />

      <JobCardsProfile :card="currentCard" :job="currentJob" />
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineOptions({ name: 'DevJobDummy' })

import { computed, ref } from 'vue'
import { dummyJobSurfaceList } from '../../../../../../../../dummy/job.dummy'

const jobSurfaces = dummyJobSurfaceList
const selectedIndex = ref(0)

const current = computed(() => jobSurfaces[selectedIndex.value] ?? jobSurfaces[0])
const currentCard = computed(() => current.value?.card ?? null)
const currentJob = computed(() => current.value?.job ?? null)
const currentKitchen = computed(() => current.value?.kitchen ?? null)

const formatMoney = (currency: string, rate: number, unit: string) => {
  const c = String(currency || '').trim() || 'CHF'
  const amount = Number(rate)
  const safe = Number.isFinite(amount) ? amount.toFixed(0) : '0'
  const u = String(unit || '').trim().toLowerCase()
  const unitLabel = u === 'shift' ? '/shift' : u === 'day' ? '/day' : '/hr'
  return `${c} ${safe}${unitLabel}`
}

const pillItems = computed(() =>
  jobSurfaces
    .map((surface) => {
      const card = surface.card
      const kitchenName = String((surface.kitchen as any)?.name ?? '').trim()
      return {
        key: surface.job?.id ?? card?.id ?? '',
        pill: {
          to: card?.to ?? '',
          title: card?.title ?? '',
          imageUrl: card?.imageUrl ?? '',
          kitchenName,
        },
      }
    })
    .filter((item) => Boolean(item.key))
)

const currentCell = computed(() => {
  const card = currentCard.value
  const job = currentJob.value
  if (!card || !job) return null
  const payBadge = formatMoney(job.pay_currency, job.pay_rate, job.pay_unit)
  const publishedBadge = 'Published 22 hours ago'
  return {
    to: card.to,
    imageUrl: card.imageUrl,
    title: card.title,
    subtitle: `${card.subtitle} · 45.6 km`,
    status: card.status,
    description: card.description,
    badges: [payBadge, publishedBadge],
  }
})

const currentPreview = computed(() => {
  const card = currentCard.value
  const job = currentJob.value
  if (!card || !job) return null
  const publishedBadge = 'Published 22 hours ago'
  const openingsBadge = job.openings_count > 1 ? `${job.openings_count} spots` : '1 spot'
  return {
    imageUrl: card.imageUrl,
    title: card.title,
    subtitle: card.subtitle,
    badges: [publishedBadge],
    prop: `${job.pay_currency} ${Number(job.pay_rate).toFixed(2)}/${job.pay_unit} · ${openingsBadge}`,
  }
})
</script>