<template>
  <div class="space-y-16 pb-20">
    <MissingBrandAssetsFlag />
    <section class="border-b border-gray-200/60 bg-white/70 py-16 dark:border-gray-800/50 dark:bg-gray-900/40">
      <UContainer class="space-y-4">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Road map</p>
        <h1 class="text-4xl font-semibold text-gray-900 dark:text-white">
          {{ appMeta.roadmap.title }}
        </h1>
        <p class="max-w-3xl text-lg text-gray-600 dark:text-gray-300">
          {{ appMeta.roadmap.summary }}
        </p>
      </UContainer>
    </section>

    <section>
      <UContainer>
        <div class="grid gap-6 md:grid-cols-3">
          <article
            v-for="phase in appMeta.roadmap.phases"
            :key="phase.label"
            class="rounded-2xl border border-gray-200/70 bg-white/80 p-6 shadow-sm dark:border-gray-800/70 dark:bg-gray-900/60"
          >
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{{ phase.label }}</p>
            <h2 class="mt-3 text-2xl font-semibold text-gray-900 dark:text-white">
              {{ phase.title }}
            </h2>
            <p class="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-300">
              {{ phase.copy }}
            </p>
          </article>
        </div>
      </UContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { appMeta } from '../content/meta'

definePageMeta({
  layout: 'landing',
  nav: {
    key: 'road-map',
    label: 'Road Map',
    icon: 'i-lucide-map',
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: appMeta.roadmap.title,
  description: appMeta.roadmap.summary,
})
</script>
