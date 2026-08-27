<template>
  <UPage>
    <UPageHeader
      headline="Docs · Components"
      title="Cross-industry components"
      description="Reusable, industry-domain ignorant FireUX components organised by ownership. Every admitted component has ten props or fewer."
    />

    <UPageBody>
      <section v-for="group in groups" :key="group.name" class="space-y-4">
        <div>
          <h2 class="text-xl font-semibold">{{ group.name }}</h2>
          <p class="text-sm text-dimmed">{{ group.description }}</p>
        </div>
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <UPageCard
            v-for="item in group.items"
            :key="item.entry.slug"
            :to="`/docs/components/${item.entry.slug}`"
            :title="item.entry.name"
            :description="item.entry.description"
          >
            <div class="space-y-3">
              <div class="flex items-center justify-between gap-3">
                <h2 class="font-semibold">{{ item.entry.name }}</h2>
                <UBadge :color="item.review.color" variant="soft">
                  {{ item.review.label }}
                </UBadge>
              </div>
              <p class="text-xs font-medium text-toned">
                {{ item.entry.owner }} · Cross-industry
              </p>
              <p class="text-sm text-dimmed">{{ item.entry.description }}</p>
              <div class="flex flex-wrap gap-2 text-xs">
                <UBadge color="primary" variant="subtle">
                  {{ item.entry.inputs.propCount }} props
                </UBadge>
                <UBadge color="info" variant="subtle">
                  {{ item.entry.usedBy.length }} uses
                </UBadge>
                <UBadge color="success" variant="subtle">
                  {{ item.entry.derived.length }} derived
                </UBadge>
              </div>
            </div>
          </UPageCard>
        </div>
      </section>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import {
  fireuxDocsCatalogue,
  reviewFireuxDocsCatalogueEntry,
} from '../../../catalogue/catalogue'

const reviewedEntries = fireuxDocsCatalogue
  .map((entry) => ({
    entry,
    review: reviewFireuxDocsCatalogueEntry(entry),
  }))
  .sort(
    (left, right) => right.entry.inputs.propCount - left.entry.inputs.propCount
  )

const categoryDescriptions = {
  Surfaces: 'Reusable interaction and data-outcome surfaces.',
  Forms: 'Fields and creation flows with explicit editing responsibilities.',
  Onboarding: 'Shared lifecycle presentation for owner-provided onboarding.',
  Profiles: 'Cross-industry profile administration actions.',
  Page: 'Shared page composition owned above individual domains.',
} as const

const groups = Object.entries(categoryDescriptions)
  .map(([name, description]) => ({
    name,
    description,
    items: reviewedEntries.filter((item) => item.entry.category === name),
  }))
  .filter((group) => group.items.length)

definePageMeta({
  layout: 'docs',
  title: 'Components',
})

useSeoMeta({
  title: 'Components · FireUX Docs',
  description: 'FireUX page children and their explicit data responsibilities.',
})
</script>
