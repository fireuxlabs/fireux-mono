<template>
  <div class="space-y-16 pb-20">
    <section class="border-b border-gray-200/60 bg-white/70 py-16 dark:border-gray-800/50 dark:bg-gray-900/40">
      <UContainer class="grid gap-10 md:grid-cols-2">
        <div class="space-y-4">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            {{ appMeta.getStarted.hero.eyebrow }}
          </p>
          <h1 class="text-4xl font-semibold text-gray-900 dark:text-white">
            {{ appMeta.getStarted.hero.title }}
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-300">
            {{ appMeta.getStarted.hero.description }}
          </p>
          <div class="flex flex-wrap gap-3">
            <UButton :to="appMeta.getStarted.hero.primaryAction.to" color="primary" size="lg">
              {{ appMeta.getStarted.hero.primaryAction.label }}
            </UButton>
            <UButton :to="appMeta.getStarted.hero.secondaryAction.to" color="neutral" variant="ghost" size="lg">
              {{ appMeta.getStarted.hero.secondaryAction.label }}
            </UButton>
          </div>
        </div>

        <div class="grid gap-4">
          <article
            v-for="step in appMeta.getStarted.steps"
            :key="step.title"
            class="rounded-2xl border border-gray-200/70 bg-white/80 p-5 shadow-sm dark:border-gray-800/70 dark:bg-gray-900/60"
          >
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {{ step.badge }}
            </p>
            <h2 class="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
              {{ step.title }}
            </h2>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">
              {{ step.copy }}
            </p>
          </article>
        </div>
      </UContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { appMeta } from '../meta'

definePageMeta({
  layout: 'landing',
  nav: {
    key: 'get-started',
    label: 'Get Started',
    icon: 'i-lucide-rocket',
    order: 10,
    position: 'bottom',
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: appMeta.seoGetStarted.title,
  description: appMeta.seoGetStarted.description,
})
</script>
